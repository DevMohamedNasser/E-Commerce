import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { userModel } from "../DB/models/user.model";
import { MailModule } from "../mail/mail.module";
import { TokenService } from "../common/services/token.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [userModel, MailModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtService],
})
export class AuthModule {}
