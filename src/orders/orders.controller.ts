import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { AuthGuard } from "../common/guards/auth.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Request } from "express";
import { Types } from "mongoose";
import Stripe from "stripe";

@Controller("api/v1/orders")
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("checkout")
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = req.user?._id as Types.ObjectId;

    return this.ordersService.createOrder(createOrderDto, userId);
  }

  // create session
  @Post("checkout/:orderId")
  @UseGuards(AuthGuard)
  async createCheckoutSession(
    @Param("orderId") orderId: Types.ObjectId,
    @Req() req: Request,
  ): Promise<Stripe.Checkout.Session> {
    const userId = req.user?._id as Types.ObjectId;
    const session = await this.ordersService.createCheckoutSession(
      orderId,
      userId,
    );
    return session;
  }

  @Post("refund/:orderId")
  @UseGuards(AuthGuard)
  async refundOrder(
    @Param("orderId") orderId: Types.ObjectId,
    @Req() req: Request
  ) {
    const userId = req.user?._id as Types.ObjectId;
    const refund = await this.ordersService.refundOrder(orderId, userId);
    return refund;
  }
}
