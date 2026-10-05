import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { createObserveModule } from "@nestjs/observe";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { resolve } from "node:path";
import { MongooseModule } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { AuthModule } from "./auth/auth.module";
import { MailModule } from "./mail/mail.module";
import chalk from "chalk";
import { LoggerMiddleware } from "./common/middlewares/logger.middleware";
import { AuthController } from "./auth/auth.controller";
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { ReviewModule } from './review/review.module';
import { CouponModule } from './coupon/coupon.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve("./config/dev.env"),
      isGlobal: true,
    }),

    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>("DB_URI"),
    //     onConnectionCreate: (connection: Connection) => {
    //       connection.on("connected", () =>
    //         console.log(chalk.bgGreen("DB connected successfully")),
    //       );
    //     },
    //   }),
    //   inject: [ConfigService]
    // }),

    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 5000,
      onConnectionCreate: (connection: Connection) => {
        connection.on("connected", () =>
          console.log(chalk.bgGreen("DB connected successfully")),
        );
      },
    }),

    AuthModule,

    MailModule,

    CategoryModule,

    BrandModule,

    ProductModule,

    CartModule,

    ReviewModule,

    CouponModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
