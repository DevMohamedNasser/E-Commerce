import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(
      `Http Error Interrupted [${req.method}] ${req.url} - Status: ${status} - Error: ${exception.message || "Internal Server Error"}`,
    );

    res.status(status).json({
      success: false,
      statusCode: status,
      timestamps: new Date().toISOString(),
      path: req.url,
      method: req.method,
      error: {
        message: exception.message || "Internal Server Error",
      },
    });
  }
}
