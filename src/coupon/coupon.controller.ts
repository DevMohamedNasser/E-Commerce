import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { AuthGuard } from "../common/guards/auth.guard";
import { AdminAuthGuard } from "../common/guards/adminAuth.guard";
import { Request } from "express";
import { Types } from "mongoose";

@Controller("api/v1/coupon")
@UseGuards(AuthGuard, AdminAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  create(@Body() createCouponDto: CreateCouponDto, @Req() req: Request) {
    const userId = req.user?._id as Types.ObjectId;
    return this.couponService.create(createCouponDto, userId);
  }

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Patch(":id")
  update(
    @Param("id") id: Types.ObjectId,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.update(id, updateCouponDto);
  }

  @Delete(":id")
  delete(@Param("id") id: Types.ObjectId) {
    return this.couponService.delete(id);
  }

  @Post("validate")
  async validate(@Body("code") code: string, @Req() req: Request) {
    const userId = req.user?._id as Types.ObjectId;
    return this.couponService.validate(code, userId);
  }
}
