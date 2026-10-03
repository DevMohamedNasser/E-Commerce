import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateReviewDto } from "./create-review.dto";

export class UpdateReviewDto extends PartialType(
  OmitType(CreateReviewDto, ["product"] as const),
) {}
