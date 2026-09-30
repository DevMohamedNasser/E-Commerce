import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly _mailService: MailerService) {}

  async sendVerificationOtp(email: string, otp: string): Promise<void> {
    try {
      await this._mailService.sendMail({
        to: email,
        subject: "Activation Account OTP",
        template: "./otp",
        context: { confirmEmailOTP: otp },
      });
    } catch (error) {
      this.logger.error(
        `Failed to send verification OTP to: ${email}: ${(error as Error).message}`,
      );
    }
  }
}
