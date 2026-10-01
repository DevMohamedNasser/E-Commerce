import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { productModel } from "../DB/models/product.model";
import { brandModel } from "../DB/models/brand.model";
import { TokenService } from "../common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import { userModel } from "../DB/models/user.model";

@Module({
  imports: [productModel, brandModel, userModel],
  controllers: [ProductController],
  providers: [ProductService, TokenService, JwtService],
})
export class ProductModule {}
