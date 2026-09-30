import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { GenderEnum, RoleEnum } from "../../common/enums/user.enum";

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20, { message: "first name must be between 2 and 20 chars long" })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 20, { message: "last name must be between 2 and 20 chars long" })
  lastName: string;

  @IsEmail({}, { message: "Provide a valid email format" })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  password: string;

  @IsEnum(GenderEnum, { message: "Provide a valid gender format" })
  @IsOptional()
  gender?: GenderEnum;

  @IsEnum(RoleEnum, { message: "Provide a valid role format" })
  @IsOptional()
  role: RoleEnum;
}
