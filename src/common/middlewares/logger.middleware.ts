import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || ""; // user agent: postman, chrome, safari, ...

    const startTime = Date.now();

    res.on("finish", () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      this.logger.log(
        `[${method}] ${originalUrl} ${statusCode} ${duration}ms - IP: ${ip} (${userAgent})`,
      );
    });

    next();
  }
}
