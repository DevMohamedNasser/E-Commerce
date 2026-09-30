import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ResendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}
