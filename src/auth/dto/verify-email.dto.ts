import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class VerifyEmailDto {
    @IsEmail()
    @IsNotEmpty()
    @Transform(({value}) => value?.toLowerCase().trim())
    email: string;

    @IsString()
    @IsNotEmpty({message: "OTP code is required"})
    confirmEmailOTP: string;
}