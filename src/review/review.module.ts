import { Module } from "@nestjs/common";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";
import { reviewModel } from "../DB/models/review.model";
import { userModel } from "../DB/models/user.model";
import { productModel } from "../DB/models/product.model";
import { TokenService } from "../common/services/token.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [reviewModel, userModel, productModel],
  controllers: [ReviewController],
  providers: [ReviewService, TokenService, JwtService],
})
export class ReviewModule {}
