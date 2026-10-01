import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { HProductDocument, Product } from "../DB/models/product.model";
import { Brand, HBrandDocument } from "../DB/models/brand.model";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly _productModel: Model<HProductDocument>,
    @InjectModel(Brand.name)
    private readonly _brandModel: Model<HBrandDocument>,
  ) {}

  private async _validateBrandCategoryRelationship(
    brandId: string,
    categoryId: string,
  ) {
    const brand = await this._brandModel.findById(brandId);
    if (!brand) throw new NotFoundException("Assigned brand not exists");

    const supportedCategoryIds = brand.categories.map((id) => id.toString());
    if (!supportedCategoryIds.includes(categoryId))
      throw new BadRequestException(
        `Business rule: the brand: ${brand.name} doesn't belong to or support specific category`,
      );
  }

  async create(
    createProductDto: CreateProductDto,
    imagesUrl: string[],
    adminId: Types.ObjectId,
  ) {
    await this._validateBrandCategoryRelationship(
      createProductDto.brand,
      createProductDto.category,
    );

    const newProduct = new this._productModel({
      ...createProductDto,
      images: imagesUrl,
      createdBy: adminId,
    });

    return (await newProduct.save()).populate("brand category createdBy");
  }

  findAll(): Promise<HProductDocument[]> {
    return this._productModel.find().populate("brand category createdBy");
  }

  async findOne(id: Types.ObjectId): Promise<HProductDocument> {
    const product = await this._productModel
      .findById(id)
      .populate("brand category createdBy");
    if (!product) throw new NotFoundException("Product not found");

    return product;
  }

  async update(
    id: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    imagesUrl?: string[],
  ) {
    const product = await this._productModel.findById(id);
    if (!product) throw new NotFoundException("Product not found");

    if (updateProductDto.brand && !updateProductDto.category)
      await this._validateBrandCategoryRelationship(
        updateProductDto.brand,
        product.category as unknown as string,
      );
    else if (!updateProductDto.brand && updateProductDto.category)
      await this._validateBrandCategoryRelationship(
        product.brand,
        updateProductDto.category,
      );
    else if (updateProductDto.brand && updateProductDto.category)
      await this._validateBrandCategoryRelationship(
        updateProductDto.brand,
        updateProductDto.category,
      );

    return (
      await this._productModel.findByIdAndUpdate(
        id,
        {
          ...updateProductDto,
          createdBy: product.createdBy, // عشان الكلاينت ميتذاكاش عليا overwrite
          ...(imagesUrl && { images: imagesUrl }),
          $inc: { __v: 1 },
        },
        { returnDocument: "after" },
      )
    )?.populate("brand category createdBy");
  }

  async delete(id: Types.ObjectId) {
    const product = await this._productModel.deleteOne({ _id: id });

    if (product.deletedCount) return { message: "done" };
    throw new NotFoundException("Product not found");
  }
}
