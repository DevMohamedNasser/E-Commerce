import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CouponService } from "../coupon.service";
import { Coupon } from "./coupon.schema";
import { CreateCouponDto } from "./dto/create-coupon.input";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { AdminAuthGuard } from "../../common/guards/adminAuth.guard";

@Resolver(() => Coupon)
export class CouponResolver {
  constructor(private readonly couponService: CouponService) {}

  // Query => Get/fetch all data
  @Query(() => [Coupon], { name: "getCoupons" })
  @UseGuards(AuthGuard, AdminAuthGuard)
  async findAll() {
    return this.couponService.findAll();
  }

  // Mutation => Create coupon
  @Mutation(() => Coupon, { name: "createCoupon" })
  @UseGuards(AuthGuard, AdminAuthGuard)
  async createCoupon(
    @Args("input") input: CreateCouponDto,
    @Context() context: any,
  ) {
    const adminId = context.req.user._id;
    return this.couponService.create(input, adminId);
  }
}
