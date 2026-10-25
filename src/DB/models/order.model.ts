import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { OrderStatusEnum } from "../../common/enums/order.enum";

@Schema({ _id: false })
export class OrderItem {
  @Prop({
    type: Types.ObjectId,
    ref: "Product",
    required: true,
  })
  product: Types.ObjectId;

  @Prop({
    type: Number,
    min: 0,
    required: true,
  })
  quantity: number;

  @Prop({
    type: Number,
    min: 0,
    required: true,
  })
  priceSnapshot: number;
}

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: [OrderItem],
    required: true,
  })
  items: OrderItem[];

  @Prop({
    type: Number,
    required: true,
  })
  subTotal: number;

  @Prop({
    type: Number,
    default: 0,
  })
  discountAmount: number;

  @Prop({
    type: Number,
    required: true,
  })
  finalTotal: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OrderStatusEnum),
    default: OrderStatusEnum.Pending,
  })
  status: string;

  @Prop({
    type: String,
    required: true,
  })
  shippingAddress: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Coupon",
  })
  appliedCoupon: string;

  @Prop({
    type: String,
  })
  intentId: string;

  @Prop({
    type: String,
  })
  refundId: string;

  @Prop({
    type: Date,
  })
  refundedAt: Date;
}

export const orderSchema = SchemaFactory.createForClass(Order);
export const orderModel = MongooseModule.forFeature([
  { name: Order.name, schema: orderSchema },
]);
export type HOrderDocument = HydratedDocument<Order>;
