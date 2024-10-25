import MemberService from "../models/Member.service";
import { T } from "../libs/types/common";
import { NextFunction, Request, Response, response } from "express";
import { ExtendedRequest, LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";


const memberService = new MemberService();  // MemberService modeli(class)dan instance olib memberService variable ga tenglashtirib olyapmiz
const authService = new AuthService();

const memberController: T = {};

// REACT loyihamiz uchun ishlatamiz

memberController.getAdmin = async (req: Request, res: Response) => {
  try {
    console.log("getAdmin");
    const result = await memberService.getAdmin();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getAdmin:", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
}

memberController.signup = async (req: Request, res: Response) => {
  try {
    console.log("signup");
    const input: MemberInput = req.body,  // kirib kelayotgan malumotni input variable ga tenglab olyabmiz 
      result: Member = await memberService.signup(input),  // hosil qilingan memberService objectini result variable(uning typei Member) ga tenglashtirib olyabmiz va hosil bolgan object orqali signup methodini ishlatamiz.
      // TODO: TOKENS AUTHENTICATION
      token = await authService.createToken(result);
    console.log("Auth token ====> ", token)

    //quyida browser cookie siga token joylashtiramiz
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false
    }); // res.cookie( 1-qanday nom bn saqlash, 2-nimani saqlash kerakligi, 3-option)
    res.status(HttpCode.CREATED).json({ member: result, accessToken: token }) // login bo'lgan user ma'lumotini response browser ga qaytaramiz
  } catch (err) {
    console.log("Error signup", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.login = async (req: Request, res: Response) => {
  try {
    console.log("login");
    const input: LoginInput = req.body,  // kirib kelayotgan malumotni input variable ga tenglab olyabmiz
      result = await memberService.login(input), // hosil qilingan memberService objectini result variable ga tenglashtirib olyabmiz va hosil bolgan object orqali login methodini ishlatamiz.
      // TODO: TOKENS AUTHENTICATION
      token = await authService.createToken(result);
    console.log("signup token ====> ", token)

    //quyida browser cookie siga token joylashtiramiz
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false
    }); // res.cookie( 1-qanday nom bn saqlash, 2-nimani saqlash kerakligi, 3-option)
    res.status(HttpCode.OK).json({ member: result, accessToken: token }) // login bo'lgan user ma'lumotini response browser ga qaytaramiz
  } catch (err) {
    console.log("Error login", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};


memberController.logout = (req: ExtendedRequest, res: Response) => {
  try {
    console.log("logout")
    res.cookie("accessToken", null, {
      maxAge: 0 /* Convenient option for setting the expiry time relative to the current time in **milliseconds*/,
      httpOnly: true /* Flags the cookie to be accessible only by the web server*/
    });
    res.status(HttpCode.OK).json({ logout: true });
  } catch (err) {
    console.log("Error logout", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.getMemberDetail = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMemberDetail");
    const result = await memberService.getMemberDetail(req.member);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error getMemberDetail", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateMember");
    const input: MemberUpdateInput = req.body;
    if (req.file) input.memberImage = req.file.path.replace(/\\/, "/");
    const result = await memberService.updateMember(req.member, input);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error updateMember:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.getTopUsers = async (req: Request, res: Response) => {
  try {
    console.log("getTopUsers");
    const result = await memberService.getTopUsers();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error getTopUsers:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }

}

memberController.verifyAuth = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);

    if (!req.member) throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    next()
  } catch (err) {
    console.log("Error verifyAuth", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
}

memberController.retrieveAuth = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);

    next()
  } catch (err) {
    console.log("Error retrieveAuth", err);
    next();
  }
}

export default memberController

