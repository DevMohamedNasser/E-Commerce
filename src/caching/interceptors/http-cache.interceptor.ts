import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import chalk from "chalk";
import { Request } from "express";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { CachingService } from "../caching.service";

@Injectable()
export class CachingInterceptor implements NestInterceptor {
  constructor(private readonly cachingService: CachingService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<Request>();

    if (req.method !== "GET") return next.handle();

    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await this.cachingService.get(cacheKey);
      if (cachedData)
        // of ترجع الداتا مباشرةً بصوره Observable لان ال interceptor بياخد قيمه Observable ترجع ع طول للكلاينت مش لسه هنعدي ع service لا ارجع للكلاينت ع طول يسطا
        return of(JSON.parse(cachedData));
    } catch (error) {
      console.log(
        chalk.red(
          `Redis read failure safely skipped: `,
          (error as Error).message,
        ),
      );
    }

    return next.handle().pipe(
      map(async (data) => {
        try {
          // ال response وهو راجع عدي ع ال interceptor خزن الداتا ٣٦٠ ثانية يعني ٦د
          if (data) {
            await this.cachingService.set(cacheKey, JSON.stringify(data), 360);
          }
        } catch (error) {
          console.log("Redis write failure");
        }
      }),
    );
  }
}
