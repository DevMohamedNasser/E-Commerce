import { Module } from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { CouponController } from "./coupon.controller";
import { couponModel } from "../DB/models/coupon.model";
import { userModel } from "../DB/models/user.model";
import { TokenService } from "../common/services/token.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [couponModel, userModel],
  controllers: [CouponController],
  providers: [CouponService, TokenService, JwtService],
})
export class CouponModule {}
