import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HUserDocument, User } from "../DB/models/user.model";
import { Model } from "mongoose";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { compareHash, generateHash } from "../common/security/hash";
import generateOTP from "../common/security/generateOTP";
import { MailService } from "../mail/mail.service";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { LoginDto } from "./dto/login.dto";
import { ProviderEnum } from "../common/enums/user.enum";
import { TokenService } from "../common/services/token.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly _userModel: Model<HUserDocument>,
    private readonly _mailService: MailService,
    private readonly _tokenService: TokenService,
  ) {}

  async signup(createAuthDto: CreateAuthDto): Promise<HUserDocument> {
    const isExist = await this._userModel.findOne({
      email: createAuthDto.email,
    });
    if (isExist) throw new ConflictException("Account already exists");

    const otp = generateOTP();
    const hashedOTP = await generateHash(otp);
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 5);

    const user = new this._userModel({
      ...createAuthDto,
      otpExpiresAt: expireTime,
      confirmEmailOTP: hashedOTP,
    });

    await user.save();

    await this._mailService.sendVerificationOtp(user.email, otp);

    return user;
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    const user = await this._userModel.findOne({ email: verifyEmailDto.email });
    if (!user) throw new NotFoundException("Account not found. Plz signup");

    if (user.confirmEmail)
      throw new BadRequestException("Account already verified!!!");

    if (new Date() > user.otpExpiresAt!)
      throw new BadRequestException("OTP has been expired. Use Resend OTP.");

    if (
      !user.confirmEmailOTP ||
      !(await compareHash(verifyEmailDto.confirmEmailOTP, user.confirmEmailOTP))
    )
      throw new BadRequestException("Incorrect OTP");

    user.confirmEmail = new Date();
    user.confirmEmailOTP = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return { message: "Account has been verified successfully" };
  }

  async resendOtp(resendOtp: ResendOtpDto): Promise<{ message: string }> {
    const { email } = resendOtp;

    const user = await this._userModel.findOne({ email });
    if (!user) throw new NotFoundException("User not found, plz signup");

    if (user.confirmEmail)
      throw new BadRequestException("Account already verified!!!");

    if (user.otpExpiresAt && new Date() < user.otpExpiresAt)
      throw new BadRequestException("Check ur inbox. User previous valid OTP");

    const otp = generateOTP();
    const hashedOTP = await generateHash(otp);
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 5);

    user.otpExpiresAt = expireTime;
    user.confirmEmailOTP = hashedOTP;
    await user.save();

    await this._mailService.sendVerificationOtp(email, otp);

    return { message: "Check ur inbox." };
  }

  async login(loginDto: LoginDto): Promise<Record<string, any>> {
    const { email, password } = loginDto;

    // const user = await this._userModel.findOne({ email, confirmEmail: { $exists: true } });
    const user = await this._userModel.findOne({ email });
    if (!user) throw new NotFoundException("User not found");

    if (!user.confirmEmail)
      throw new BadRequestException("Verify ur account first!!!");

    if (user.provider === ProviderEnum.Google)
      throw new BadRequestException("Plz login with Google");

    if (!(await compareHash(password, user.password)))
      throw new UnauthorizedException("Invalid email or password");

    const tokens = await this._tokenService.generateTokens(
      user._id as unknown as string,
      user.role,
    );

    return { message: "done", tokens };
  }

  async saveProfilePic(
    userId: string,
    filePath: string,
  ): Promise<HUserDocument> {
    const publicUrl = `http://127.0.0.1:${process.env.PORT}/${filePath.replace(/\\/g, "/")}`;

    const updatedUser = await this._userModel.findByIdAndUpdate(
      userId,
      {
        profilePic: publicUrl,
        $inc: { __v: 1 },
      },
      { returnDocument: "after" },
    );
    if (!updatedUser) throw new NotFoundException("User not found");

    return updatedUser;
  }
}
