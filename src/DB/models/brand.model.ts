import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  timestamps: true,
})
export class Brand {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 20,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  logo: string;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
  })
  categories: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  createdBy: string;
}

export const brandSchema = SchemaFactory.createForClass(Brand);

export const brandModel = MongooseModule.forFeature([
  { name: Brand.name, schema: brandSchema },
]);
export type HBrandDocument = HydratedDocument<Brand>;
