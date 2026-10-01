import { Transform, Type } from "class-transformer";
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
} from "class-validator";

export class CreateProductDto {
  @IsString({ message: "Product name must be string" })
  @IsNotEmpty({ message: "Product name is required" })
  @Length(2, 200, { message: "Product name must be between 2 and 200" })
  @Transform(({ value }) => value?.trim())
  name: string;

  @Type(() => Number)
  @IsNumber({}, { message: "price must be a valid number" })
  @Min(0, { message: "price can't be 0 or negative" })
  price: number;

  @Type(() => Number)
  @IsNumber({}, { message: "stock must be a valid number" })
  @Min(0, { message: "stock can't be 0 or negative" })
  @IsInt()
  stock: number;

  @IsMongoId({ message: "Invalid brand id format" })
  @IsNotEmpty({ message: "brand id is required" })
  brand: string;

  @IsMongoId({ message: "Invalid category id format" })
  @IsNotEmpty({ message: "category id is required" })
  category: string;
}
