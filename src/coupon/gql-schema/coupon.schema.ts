import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "../../DB/models/user.model";

@ObjectType()
@Schema({
  timestamps: true,
})
export class Coupon {
  @Field(() => ID)
  _id!: string;

  @Field(() => String)
  @Prop({
    type: String,
    unique: true,
    uppercase: true,
    required: true,
    trim: true,
  })
  code: string;

  @Field(() => Int)
  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 100,
  })
  discountPercentage: number;

  @Field(() => String)
  @Prop({
    type: Date,
    required: true,
  })
  expiryDate: Date;

  @Field(() => [ID])
  @Prop({
    type: [{ type: Types.ObjectId }],
    default: [],
  })
  usedBy: Types.ObjectId[];

  @Field(() => Int)
  @Prop({
    type: Number,
    required: true,
    min: 1,
    default: 100,
  })
  maxUsage: number;

  @Field(() => Int)
  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  usedCount: number;

  @Field(() => User)
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
