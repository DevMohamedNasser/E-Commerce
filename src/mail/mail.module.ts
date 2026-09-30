import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "node:path";
import { EjsAdapter } from "@nestjs-modules/mailer/adapters/ejs.adapter";
import { MailService } from "./mail.service";

@Module({
  providers: [MailService],

  // imports: [
  //   MailerModule.forRoot({
  //     transport: {
  //       service: "Gmail",
  //       auth: {
  //         user: process.env.MAIL_USER,
  //         pass: process.env.MAIL_PASS,
  //       },
  //     },
  //     defaults: {
  //       from: `"No Reply" <${process.env.MAIL_USER}>`,
  //     },
  //     template: {
  //       dir: join(__dirname, "templates"),
  //       adapter: new EjsAdapter(),
  //     },
  //   }),
  // ],

  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: "Gmail",
          auth: {
            user: configService.get<string>("MAIL_USER"),
            pass: configService.get<string>("MAIL_PASS"),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>("MAIL_USER")}>`,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new EjsAdapter(),
        },
      }),
    }),
  ],

  exports: [MailService],
})
export class MailModule {}
