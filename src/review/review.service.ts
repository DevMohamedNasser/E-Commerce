import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { HReviewDocument, Review } from "../DB/models/review.model";
import { HProductDocument, Product } from "../DB/models/product.model";

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly _reviewModel: Model<HReviewDocument>,
    @InjectModel(Product.name)
    private readonly _productModel: Model<HProductDocument>,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: Types.ObjectId) {
    const product = await this._productModel.exists({
      _id: createReviewDto.product,
    });
    if (!product)
      throw new NotFoundException("The product u want to review doesn't exist");

    const alreadyReviewed = await this._reviewModel.exists({
      product: createReviewDto.product,
      user: userId,
    });

    if (alreadyReviewed)
      throw new ConflictException(
        "U have already submitted a review for this product. Use update instead",
      );

    const newReview = new this._reviewModel({
      ...createReviewDto,
      user: userId,
    });

    return (await newReview.save()).populate(
      "user",
      "firstName lastName email -_id",
    );
  }

  async update(
    reviewId: Types.ObjectId,
    updateReviewDto: UpdateReviewDto,
    userId: Types.ObjectId,
  ) {
    const review = await this._reviewModel.findOne({
      _id: reviewId,
      user: userId,
    });
    if (!review)
      throw new NotFoundException("Review not found or unauthorized action");

    if (updateReviewDto.rating) review.rating = updateReviewDto.rating;
    if (updateReviewDto.comment) review.comment = updateReviewDto.comment;
    review.$inc("__v", 1);

    return (await review.save()).populate(
      "user",
      "firstName lastName email -_id",
    );
  }

  findByProduct(productId: Types.ObjectId) {
    return this._reviewModel
      .find({ product: productId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
  }

  async delete(reviewId: Types.ObjectId, userId: Types.ObjectId) {
    const review = await this._reviewModel.deleteOne({
      user: userId,
      _id: reviewId,
    });

    if (!review.deletedCount)
      throw new NotFoundException("Review not found or unauthorized action");

    return {
      message: "Review deleted successfully",
    };
  }
}
