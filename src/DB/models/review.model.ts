import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  timestamps: true,
})
export class Review {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: "Product",
    required: true,
  })
  product: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 5,
  })
  rating: number;

  @Prop({
    type: String,
    required: true,
    minLength: 3,
    maxLength: 500,
  })
  comment: string;
}

export const reviewSchema = SchemaFactory.createForClass(Review);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const reviewModel = MongooseModule.forFeature([
  { name: Review.name, schema: reviewSchema },
]);
export type HReviewDocument = HydratedDocument<Review>;
