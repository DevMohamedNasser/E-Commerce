import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger("Performance");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const ctx = context.switchToHttp();
    // const req = ctx.getRequest<Request>();
    // const { method, url } = req;

    // const startTime = Date.now();
    // this.logger.log(`Before handling route: [${method}] ${url}`);

    let method: string;
    let url: string;

    if (context.getType<string>() === "graphql") {
      const gqlContext = GqlExecutionContext.create(context);
      const req = gqlContext.getContext()?.req as Request | undefined;

      method = req?.method ?? "GRAPHQL";
      url = req?.url ?? "GraphQL";
    } else {
      const req = context.switchToHttp().getRequest<Request>();

      method = req?.method ?? "UNKNOWN";
      url = req?.originalUrl ?? req?.url ?? "UNKNOWN";
    }

    const startTime = Date.now();

    this.logger.log(`Before handling route: [${method}] ${url}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `After handling route: [${method}] ${url} - took: ${duration}ms`,
        );
      }),
    );
  }
}
