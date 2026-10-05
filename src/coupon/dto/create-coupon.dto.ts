import { Type } from "class-transformer";
import { IsDate, IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(1)
  @Max(100)
  discountPercentage: number;

  @IsDate()
  @Type(() => Date)
  expiryDate: Date;

  @IsInt()
  @Min(1)
  maxUsage: number;
}
