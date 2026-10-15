import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsString()
  @IsOptional()
  appliedCoupon?: string;
}
