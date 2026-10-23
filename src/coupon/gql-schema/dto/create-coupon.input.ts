import { Field, InputType, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsDate, IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

@InputType()
export class CreateCouponDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  code: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercentage: number;

  @Field(() => String)
  @IsDate()
  @Type(() => Date)
  expiryDate: Date;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  maxUsage: number;
}
