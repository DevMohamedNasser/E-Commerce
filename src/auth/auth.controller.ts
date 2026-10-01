import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthGuard } from "../common/guards/auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "../common/utils/multer.util";
import { Request } from "express";

@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/signup")
  async signup(@Body() createAuthDto: CreateAuthDto) {
    const user = await this.authService.signup(createAuthDto);

    return {
      success: true,
      message: "Verify ur account. Check inbox",
      data: { user },
    };
  }

  @Patch("/verify-email")
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto);
  }

  @Patch("resend-otp")
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return await this.authService.resendOtp(resendOtpDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Get("profile")
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    return {
      message: "done",
      data: req.user,
    };
  }

  @Patch("profile-pic")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async uploadProfilePic(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user!._id.toString();
    const filePath = file.path;
    const updatedUser = await this.authService.saveProfilePic(userId, filePath);

    return {
      message: "Profile picture updated successfully",
      user: updatedUser,
    };
  }
}
