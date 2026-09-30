import { Transform } from "class-transformer";
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Length,
} from "class-validator";

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty({ message: "Brand name is required" })
  @Length(2, 20, { message: "Brand name must be between 2 and 20" })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsArray({ message: "Categories must be in an arrays" })
  @IsMongoId({
    each: true,
    message: "Each category must be a valid mongoDB ObjectId",
  })
  @IsNotEmpty({ message: "At least 1 category ID must be exists" })
  @Transform(({ value }) => {
    if (value) {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (error) {
          return value;
        }
      }
      return value;
    }
  })
  categories: string[];
}
