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
}
