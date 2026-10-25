import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { HOrderDocument, Order } from "../DB/models/order.model";
import { Cart, HCartDocument } from "../DB/models/cart.model";
import { HProductDocument, Product } from "../DB/models/product.model";
import { Coupon, HCouponDocument } from "../DB/models/coupon.model";
import { CouponService } from "../coupon/coupon.service";
import { OrderStatusEnum } from "../common/enums/order.enum";
import { SocketService } from "../socket/socket.service";
import { HUserDocument } from "../DB/models/user.model";
import { PaymentService } from "../common/services/payment/payment.service";
import Stripe from "stripe";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly _orderModel: Model<HOrderDocument>,
    @InjectModel(Cart.name) private readonly _cartModel: Model<HCartDocument>,
    @InjectModel(Product.name)
    private readonly _productModel: Model<HProductDocument>,
    @InjectModel(Coupon.name)
    private readonly _couponModel: Model<HCouponDocument>,
    private readonly _couponService: CouponService,
    private readonly _socketService: SocketService,
    private readonly _paymentService: PaymentService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, userId: Types.ObjectId) {
    // 1. Fetch user cart
    const cart = await this._cartModel.findOne({ user: userId });
    if (!cart || !cart.items.length)
      throw new BadRequestException(
        "Ur checkout pipeline failed: Cart is currently empty",
      );

    const orderItems: any[] = [];
    let calculatedSubTotal: number = 0;

    // Validate inventory stock
    for (const item of cart.items) {
      const dbProduct = await this._productModel.findById(item.product);
      if (!dbProduct)
        throw new NotFoundException(
          "Checkout aborted. Product ID no longer exists",
        );

      if (dbProduct.stock < item.quantity)
        throw new BadRequestException(
          `Insufficient stock. Only ${dbProduct.stock} units available`,
        );

      calculatedSubTotal += dbProduct.price * item.quantity;

      // update stock
      const updatedProduct = await this._productModel.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { returnDocument: "after" },
      );
      if (updatedProduct) {
        if (updatedProduct.stock <= 5 && updatedProduct.stock > 0) {
          this._socketService.emitToRoom(
            `product:${updatedProduct._id}`,
            "lowStockAlert",
            {
              productId: updatedProduct._id,
              productName: updatedProduct.name,
              currentStock: updatedProduct.stock,
              message: `Running low! Only ${updatedProduct.stock} units available`,
            },
          );
        }
        if (updatedProduct.stock === 0) {
          this._socketService.emitToAll("productSoldOut", {
            productId: updatedProduct._id,
            productName: updatedProduct.name,
            message: `${updatedProduct.name} is out of stock`,
          });
        }
      }

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        priceSnapshot: dbProduct.price,
      });
    }

    // Validate applied coupons
    let discountAmount: number = 0;
    let targetCoupon: HCouponDocument | null = null;

    if (createOrderDto.appliedCoupon) {
      targetCoupon = await this._couponService.validate(
        createOrderDto.appliedCoupon,
        userId,
      );

      discountAmount =
        calculatedSubTotal * (targetCoupon.discountPercentage / 100);
    }

    const finalTotal = calculatedSubTotal - discountAmount;

    if (targetCoupon) {
      await this._couponModel.findByIdAndUpdate(targetCoupon._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: userId },
      });
    }

    const order = new this._orderModel({
      user: userId,
      items: orderItems,
      subTotal: calculatedSubTotal,
      discountAmount,
      finalTotal,
      shippingAddress: createOrderDto.shippingAddress,
      appliedCoupon: targetCoupon?._id || null,
      status: OrderStatusEnum.Pending,
    });
    await order.save();

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    return order;
  }

  async createCheckoutSession(
    orderId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Stripe.Checkout.Session> {
    const order = await this._orderModel
      .findOne({
        _id: orderId,
        user: userId,
        status: OrderStatusEnum.Pending,
      })
      .populate<{ user: HUserDocument }>([
        { path: "user" },
        { path: "appliedCoupon" },
      ]);
    if (!order) throw new NotFoundException("Order not found");

    const amount = order.finalTotal ?? order.subTotal ?? 0;
    // const quantity = order.items.reduce(
    //   (total, item) => total + item.quantity,
    //   0,
    // );

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: `Order: ${order.user.firstName}`,
            description: `Payment for order on address ${order.shippingAddress}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ];

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (order.discountAmount) {
      const coupon = await this._paymentService.createCoupon({
        duration: "once",
        currency: "egp",
        percent_off: (order.discountAmount / order.subTotal) * 100,
      });
      discounts.push({ coupon: coupon.id });
    }

    const session = await this._paymentService.checkoutSession({
      customer_email: order.user.email,
      mode: "payment",
      discounts,
      line_items,
      metadata: { orderId: orderId.toString() },
    });

    const method = await this._paymentService.createPaymentMethod({
      type: "card",
      card: {
        token: "tok_visa",
      },
    });

    const intent = await this._paymentService.createPaymentIntent({
      amount: order.subTotal * 100,
      currency: "egp",
      payment_method: method.id,
      allowed_payment_method_types: ["card"],
    });

    order.intentId = intent.id;
    await order.save();

    await this._paymentService.confirmPaymentIntent(intent.id);

    return session;
  }

  async refundOrder(orderId: Types.ObjectId, userId: Types.ObjectId) {
    const order = await this._orderModel.findOne({
      _id: orderId,
      user: userId,
    });
    if (!order) throw new NotFoundException("Order not found");

    if (!order.intentId)
      throw new BadRequestException("No payment intent found for this order");

    const refund = await this._paymentService.createRefund(order.intentId);
    const updatedOrder = await this._orderModel.findByIdAndUpdate(
      order.id,
      {
        status: OrderStatusEnum.Canceled,
        refundId: refund.id,
        refundedAt: new Date(),
        $unset: { intentId: true },
        $inc: { __v: 1 },
      },
      { returnDocument: "after" },
    );

    return updatedOrder;
  }
}
