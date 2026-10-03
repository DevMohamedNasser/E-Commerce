import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { cartModel } from "../DB/models/cart.model";
import { productModel } from "../DB/models/product.model";
import { TokenService } from "../common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import { userModel } from "../DB/models/user.model";

@Module({
  imports: [cartModel, productModel, userModel],
  controllers: [CartController],
  providers: [CartService, TokenService, JwtService],
})
export class CartModule {}
