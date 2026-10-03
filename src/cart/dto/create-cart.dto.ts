import { IsInt, IsMongoId, IsNotEmpty, Min } from "class-validator";

export class AddToCartDto {
    @IsMongoId({message: "Invalid product id"})
    @IsNotEmpty()
    productId: string;

    @IsInt()
    @IsNotEmpty()
    @Min(1)
    quantity: number;
}
