import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Product {
  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 200,
    trim: true,
  })
  name: string;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  price: number;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  stock: number;

  @Prop([
    {
      type: String,
      required: true,
    },
  ])
  images: string[];

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: "Brand",
  })
  brand: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Category",
    required: true,
  })
  category: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: "User",
  })
  createdBy: Types.ObjectId;
}

export const productSchema = SchemaFactory.createForClass(Product);
export const productModel = MongooseModule.forFeature([
  { name: Product.name, schema: productSchema },
]);
export type HProductDocument = HydratedDocument<Product>;
