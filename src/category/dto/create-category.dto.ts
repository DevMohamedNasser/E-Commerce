import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: "Category name is required" })
  @Length(2, 20, { message: "Category name must be between 2 & 20 chars" })
  @Transform(({ value }) => value?.trim())
  name: string;
}
