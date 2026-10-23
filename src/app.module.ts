import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { createObserveModule } from "@nestjs/observe";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { join, resolve } from "node:path";
import { MongooseModule } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { AuthModule } from "./auth/auth.module";
import { MailModule } from "./mail/mail.module";
import chalk from "chalk";
import { LoggerMiddleware } from "./common/middlewares/logger.middleware";
import { AuthController } from "./auth/auth.controller";
import { CategoryModule } from "./category/category.module";
import { BrandModule } from "./brand/brand.module";
import { ProductModule } from "./product/product.module";
import { CartModule } from "./cart/cart.module";
import { ReviewModule } from "./review/review.module";
import { CouponModule } from "./coupon/coupon.module";
import { CachingModule } from "./caching/caching.module";
import { OrdersModule } from "./orders/orders.module";
import { SocketModule } from "./socket/socket.module";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Request } from "express";

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

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: "/api/v1/graphql",
      autoSchemaFile: join(process.cwd(), "src/schema/.gql"),
      sortSchema: true,
      context: ({ req }: { req: Request }) => ({ req }),
    }),

    AuthModule,

    MailModule,

    CategoryModule,

    BrandModule,

    ProductModule,

    CartModule,

    ReviewModule,

    CouponModule,

    CachingModule,

    OrdersModule,

    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }

  // // Nest Hooks => nest docs => Fundamentals => Lifecycle events
  // onApplicationShutdown(signal: string) {
  //   console.log(
  //     `5. onApplicationShutdown - All resources are cleaned up. ${signal}`,
  //   );
  // }
  // beforeApplicationShutdown(signal: string) {
  //   console.log(
  //     `4. beforeApplicationShutdown - Stopping http connection. ${signal}`,
  //   );
  // }
  // onModuleDestroy() {
  //   console.log(`3. onModuleDestroy - Starting shutdown sequence`);
  // }
  // onModuleInit() {
  //   console.log(`1. onModuleInit - App service dependencies is initialized`);
  // }
  // onApplicationBootstrap() {
  //   console.log(
  //     `2. onApplicationBootstrap - After collecting controllers & providers but before network layer(port number)`,
  //   );
  // }
}
