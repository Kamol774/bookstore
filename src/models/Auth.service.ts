import Errors, { HttpCode, Message } from "../libs/errors";
import { AUTH_TIMER } from "../libs/config";
import { Member } from "../libs/types/member";
import jwt from "jsonwebtoken";

class AuthService {
  private readonly secretToken;

  constructor() {
    this.secretToken = process.env.SECRET_TOKEN as string;
  }

  /** Token creation **/
  public async createToken(payload: Member): Promise<String> {
    // payload bu biz tokenga almashtirmoqchi bo'lgan narsa (kirib kelgan malumot)
    return new Promise((resolve, reject) => {
      const duration = `${AUTH_TIMER}h`;
      jwt.sign(
        payload,
        process.env.SECRET_TOKEN as string,
        {
          expiresIn: duration,
        },
        (err, token) => {
          if (err)
            reject(
              new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATED_FAILED)
            );
          else resolve(token as string);
        }
      );
    });
  }

  public async checkAuth(token: string): Promise<Member> {
    const result: Member = (await jwt.verify(
      token,
      this.secretToken
    )) as Member; // jwt external package ni verify methodini chaqiryapmiz. U cookies dagi token dan membernickni olib beryapti. token mavjud bo'lmagan paytda xatolik beradi
    console.log(`------ [AUTH] memberNick: ${result.memberNick} ------`);
    return result;
  }
}

export default AuthService;
