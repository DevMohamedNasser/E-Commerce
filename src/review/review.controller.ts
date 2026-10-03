import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { AuthGuard } from "../common/guards/auth.guard";
import { Request } from "express";
import { Types } from "mongoose";

@Controller("api/v1/review")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post("")
  @UseGuards(AuthGuard)
  create(@Body() createReviewDto: CreateReviewDto, @Req() req: Request) {
    const userId = req.user?._id as Types.ObjectId;
    return this.reviewService.create(createReviewDto, userId);
  }

  @Patch("/:reviewId")
  @UseGuards(AuthGuard)
  update(
    @Param("reviewId") reviewId: Types.ObjectId,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req: Request,
  ) {
    const userId = req.user?._id as Types.ObjectId;
    return this.reviewService.update(reviewId, updateReviewDto, userId);
  }

  @Get("product/:productId")
  findByProduct(@Param("productId") productId: Types.ObjectId) {
    return this.reviewService.findByProduct(productId);
  }

  @Delete("/:reviewId")
  @UseGuards(AuthGuard)
  delete(@Param("reviewId") reviewId: Types.ObjectId, @Req() req: Request) {
    const userId = req.user?._id as Types.ObjectId;
    return this.reviewService.delete(reviewId, userId);
  }
}
