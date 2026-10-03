import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
  _id: false,
})
export class CartItem {
  @Prop({
    type: Types.ObjectId,
    ref: "Product",
    required: true,
  })
  product: string;

  @Prop({
    type: Number,
    min: 1,
    required: true,
  })
  quantity: number;

  @Prop({
    type: Number,
    required: true,
    min: 1,
  })
  pricePerUnit: number;

  @Prop({
    type: Number,
    required: true,
    min: 1,
  })
  subTotal: number;
}

@Schema({
  timestamps: true,
})
export class Cart {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  })
  user: string;

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];

  @Prop({
    type: Number,
    required: true,
    min: 0,
    default: 0,
  })
  totalPrice: number;
}

export const cartSchema = SchemaFactory.createForClass(Cart);
export type HCartDocument = HydratedDocument<Cart>;
export const cartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: cartSchema },
]);
