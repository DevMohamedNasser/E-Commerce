import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { orderModel } from "../DB/models/order.model";
import { cartModel } from "../DB/models/cart.model";
import { productModel } from "../DB/models/product.model";
import { couponModel } from "../DB/models/coupon.model";
import { TokenService } from "../common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import { CouponService } from "../coupon/coupon.service";
import { userModel } from "../DB/models/user.model";

@Module({
  imports: [orderModel, cartModel, productModel, couponModel, userModel],
  controllers: [OrdersController],
  providers: [OrdersService, TokenService, JwtService, CouponService],
})
export class OrdersModule {}
