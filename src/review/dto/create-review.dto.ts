import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

export class CreateReviewDto {
  @IsMongoId({ message: "Invalid Product reference ID" })
  @IsNotEmpty({ message: "Product ID is required" })
  product: string;

  @IsNumber()
  @Min(1, { message: "Rating must be at least 1" })
  @Max(5, { message: "Rating must be at most 5" })
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty({ message: "comment ID is required" })
  @Length(3, 500)
  comment: string;
}
