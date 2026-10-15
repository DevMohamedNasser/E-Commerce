import { Global, Module } from "@nestjs/common";
import { CachingService } from "./caching.service";
import { CachingInterceptor } from "./interceptors/http-cache.interceptor";

@Global()
@Module({
  providers: [CachingService, CachingInterceptor],
  exports: [CachingService, CachingInterceptor],
})
export class CachingModule {}
