// togridan togri controller bn ishlaydigan model
import MemberModel from "../schema/Member.model";
import { LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/errors";
import { MemberStatus, MemberType } from "../libs/enum/member.enum";
import * as bcrypt from "bcryptjs"
import { shapeaIntoMongooseObjectId } from "../libs/config";

class MemberService {
  // property
  private readonly memberModel;

  constructor() {
    this.memberModel = MemberModel;   // memberModel ni schema dagi MemberModel iga tenglab olamz 
  }

  /** SPA *////////////////////////////////////////////////////////////////////

  public async getAdmin(): Promise<Member> {
    const result = await this.memberModel
      .findOne({ memberType: MemberType.ADMIN })
      .lean() //documentni edit qilish(ma'lumot qo'shish, o'zgartirish) imkonini beradi
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }
  public async signup(input: MemberInput): Promise<Member> {
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";    
      return result.toJSON();  
    } catch (err) {
      console.log("Error, model:signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE)
    }
  }

  public async login(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        {
          memberNick: input.memberNick,
          memberStatus: { $ne: MemberStatus.DELETE }, // ne- not equal  
        },
        { memberNick: 1, memberPassword: 1, memberStatus: 1 } //options
      )
      .exec();
    /// delete bo'lgan user ga login cheklanadi
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    else if (member.memberStatus === MemberStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    console.log("member:", member);

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    ); // kiritilayotgan password bazadagi user passwordi bilan birxilmi yo'qmi solishtiramiz

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }
    return await this.memberModel.findById(member._id).lean().exec();
    // leandatabasedan olgan malumotimizni ozgartirish imkoniyati boladi 

  }

  public async getMemberDetail(member: Member): Promise<Member> {
    const memberId = shapeaIntoMongooseObjectId(member._id);
    const result = await this.memberModel.findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE }).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async updateMember(member: Member, input: MemberUpdateInput): Promise<Member> {
    const memberId = shapeaIntoMongooseObjectId(member._id);
    const result = await this.memberModel
      .findOneAndUpdate({ _id: memberId }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }

  public async getTopUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({
        memberStatus: MemberStatus.ACTIVE,
        memberPoints: { $gte: 1 },
      })
      .sort({ memberPoints: -1 })
      .limit(4).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async addUserPoint(member: Member, point: number): Promise<Member> {
    const memberId = shapeaIntoMongooseObjectId(member._id);

    return await this.memberModel.findByIdAndUpdate(
      {
        _id: memberId,
        memberType: MemberType.USER,
        MemberStatus: MemberStatus.ACTIVE,
      },
      { $inc: { memberPoints: point } }, // nimani o'zgartirish kk 
      { new: true } // option
    )
      .exec();
  }



  /** SSR */////////////////////////////////////////////////////////////////////


  // promise(void) : typescript bolganligi uchun bu method hech nmaani qaytarmaslik uchun yoziladigan shart
  // agar async function bolmasa demak promise ishlatmaymiz
  // processSignup methodini parameteriga input ni pass qilamiz va uning type MemberInput
  // processSignup methodini parametri ->input
  public async processSignup(input: MemberInput): Promise<Member> {
    // databasega bogliq mantiq:
    // exist variable hosil qilib oldik
    // exist -> restoran accounti allaqachon bazada mavjud yoki yo'qligini tekshirish, bor bo'lsa boshqa ochishga ruxsat bermaydi
    const exist = await this.memberModel
      .findOne({ memberType: MemberType.ADMIN })  //  .findOne()memberModelni ni static methodi
      .exec();   // davomiy query larni (to'xtatish) tamomlash uchun ya'ni shu oxirgisi degan ma'noda ishlatamiz
    console.log("exist", exist);
    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);  //1 ta dan ortiq restaurant ochilishiga qarshi mantiq

    // kiritilgan passwordni xavfsiz bo'lishi uchun hashlab (chunarsiz qilib) bazaga joylimiz
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    try {
      // Yangi Burak restaurant ni hosil qilamz static method orqali.
      // memberSchema modelmni .create methodini ishlatdik.
      // natijani result variable ga tenglab oldik
      const result = await this.memberModel.create(input);

      result.memberPassword = "";         // passwordni hide qildik "" bo'sh stringga tenglab
      return result;         // va result ga biriktirilgan natijani return qildik
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED)
    }
  }

  public async processLogin(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        { memberNick: input.memberNick }, // searching
        { memberNick: 1, memberPassword: 1 }  // options / compare qilish uchun bazadagi malumotni chaqiryapmiz
      )
      .exec()
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    ); // kiritilayotgan password bazadagi user passwordi bilan birxilmi yo'qmi solishtiramiz

    if (!isMatch) throw new Errors(HttpCode.NOT_FOUND, Message.WRONG_PASSWORD);
    return await this.memberModel.findById(member._id).exec();
  }

  public async getUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({ memberType: MemberType.USER })
      .exec();
    // agar result bo'sh qaytsa (natijasizlik) bo'sa quyida o'zimiz customise error hosil qilyapmiz
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  // Define qismi: updateChosenUser ning 1 ta parametri bor: input
  public async updateChosenUser(input: MemberUpdateInput): Promise<Member> {
    input._id = shapeaIntoMongooseObjectId(input._id); // kelayotgan input(string)ni Mongoose-object-id ga o'zgartirib olamiz 
    const result = await this.memberModel
      .findByIdAndUpdate({ _id: input._id }, input, { new: true })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}

export default MemberService;