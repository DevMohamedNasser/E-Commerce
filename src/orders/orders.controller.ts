import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { AuthGuard } from "../common/guards/auth.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Request } from "express";
import { Types } from "mongoose";

@Controller("api/v1/orders")
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("checkout")
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = req.user?._id as Types.ObjectId;

    return this.ordersService.createOrder(createOrderDto, userId);
  }
}
