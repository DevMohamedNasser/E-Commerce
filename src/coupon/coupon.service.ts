import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Coupon, HCouponDocument } from "../DB/models/coupon.model";

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly _couponModel: Model<HCouponDocument>,
  ) {}

  async create(createCouponDto: CreateCouponDto, userId: Types.ObjectId) {
    const cleanCode = createCouponDto.code.toUpperCase().trim();

    const existing = await this._couponModel.exists({ code: cleanCode });
    if (existing)
      throw new ConflictException(
        "A coupon with this code already exists. Try another",
      );

    const newCoupon = new this._couponModel({
      ...createCouponDto,
      code: cleanCode,
      createdBy: userId,
    });

    return (await newCoupon.save()).populate(
      "createdBy",
      "email firstName lastName -_id",
    );
  }

  findAll() {
    return this._couponModel
      .find()
      .populate("createdBy", "firstName lastName email -_id");
  }

  async update(id: Types.ObjectId, updateCouponDto: UpdateCouponDto) {
    const coupon = await this._couponModel.findByIdAndUpdate(
      id,
      updateCouponDto,
      { returnDocument: "after" },
    );
    if (!coupon) throw new NotFoundException("Coupon not found");

    return coupon;
  }

  async delete(id: Types.ObjectId) {
    const coupon = await this._couponModel.deleteOne({ _id: id });

    if (!coupon.deletedCount) throw new NotFoundException("Coupon not found");

    return { message: "Coupon deleted successfully" };
  }

  async validate(code: string, userId: Types.ObjectId) {
    const coupon = await this._couponModel.findOne({
      code: code.toUpperCase().trim(),
    });
    if (!coupon)
      throw new NotFoundException("Oops! coupon is invalid or expired");

    if (new Date() > coupon.expiryDate)
      throw new BadRequestException("Oops! coupon is invalid or expired");

    if (coupon.usedCount >= coupon.maxUsage)
      throw new BadRequestException("Oops! coupon is invalid or expired");

    const hasUsed = coupon.usedBy.includes(userId);
    if (hasUsed)
      throw new BadRequestException("Oops! coupon is invalid or expired");

    return coupon;
  }
}
