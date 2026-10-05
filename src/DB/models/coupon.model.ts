import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  timestamps: true,
})
export class Coupon {
  @Prop({
    type: String,
    unique: true,
    uppercase: true,
    required: true,
    trim: true,
  })
  code: string;

  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 100,
  })
  discountPercentage: number;

  @Prop({
    type: Date,
    required: true,
  })
  expiryDate: Date;

  @Prop({
    type: [{ type: Types.ObjectId }],
    default: [],
  })
  usedBy: Types.ObjectId[];

  @Prop({
    type: Number,
    required: true,
    min: 1,
    default: 100,
  })
  maxUsage: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  usedCount: number;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  createdBy: Types.ObjectId;
}

export const couponSchema = SchemaFactory.createForClass(Coupon);

couponSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

export const couponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: couponSchema },
]);
export type HCouponDocument = HydratedDocument<Coupon>;
