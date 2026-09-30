import { NestFactory } from "@nestjs/core";
import { AppModule, ObserveInstrument } from "./app.module";
import chalk from "chalk";
// import { AllExceptionsFilter } from "./common/filters/all-exceptions.filters";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { LoggerInterceptor } from "./common/interceptors/logger.interceptor";
import * as express from "express";
import { join } from "node:path";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use("/uploads", express.static(join(__dirname, "..", "uploads")));

  // app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggerInterceptor(),
  );
  await app.listen(process.env.PORT ?? 7000, () =>
    console.log(chalk.bgGreen(`Server is running on ${process.env.PORT}`)),
  );
}
bootstrap().catch((err) => {
  console.log(chalk.bgRed(err));
  process.exit(1);
});
