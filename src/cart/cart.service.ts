import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AddToCartDto } from "./dto/create-cart.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Cart, HCartDocument } from "../DB/models/cart.model";
import { Model } from "mongoose";
import { HProductDocument, Product } from "../DB/models/product.model";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly _cartModel: Model<HCartDocument>,
    @InjectModel(Product.name)
    private readonly _productModel: Model<HProductDocument>,
  ) {}

  private recalculateCartTotal(cart: HCartDocument): void {
    let total = 0;
    for (const item of cart.items) {
      item.subTotal = item.pricePerUnit * item.quantity;
      total += item.subTotal;
    }
    cart.totalPrice = total;
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<HCartDocument> {
    const { productId, quantity } = dto;

    const product = await this._productModel.findById(productId);
    if (!product) throw new NotFoundException("Product not found");

    if (quantity > product.stock)
      throw new BadRequestException(
        `Insufficient stock. Only ${product.stock} units available`,
      );

    let cart = await this._cartModel.findOne({ user: userId });
    if (!cart) cart = new this._cartModel({ user: userId, items: [] });

    const existingItemsIdx = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingItemsIdx > -1) {
      const targetNewQuantity =
        cart.items[existingItemsIdx].quantity + quantity;
      if (targetNewQuantity > product.stock)
        throw new BadRequestException(
          `Can't add. Combined cart total ${targetNewQuantity} exceeds available stock ${product.stock}`,
        );
      cart.items[existingItemsIdx].quantity = targetNewQuantity;
    } else {
      cart.items.push({
        product: productId,
        pricePerUnit: product.price,
        quantity,
        subTotal: quantity * product.price,
      });
    }

    this.recalculateCartTotal(cart);

    return (await cart.save()).populate("items.product");
  }

  async getCart(userId: string) {
    let cart = await this._cartModel
      .findOne({ user: userId })
      .populate("items.product");

    if (!cart) {
      cart = new this._cartModel({ user: userId, items: [] });
      return await cart.save();
    }

    return cart;
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this._cartModel.findOne({ user: userId });
    if (!cart)
      throw new NotFoundException(
        "Cart not found for this user context session",
      );

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    this.recalculateCartTotal(cart);

    return (await cart.save()).populate("items.product");
  }
}
