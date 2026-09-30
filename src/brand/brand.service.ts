import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Brand, HBrandDocument } from "../DB/models/brand.model";
import { Category, HCategoryDocument } from "../DB/models/category.model";

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Category.name)
    private readonly _categoryModel: Model<HCategoryDocument>,
    @InjectModel(Brand.name)
    private readonly _brandModel: Model<HBrandDocument>,
  ) {}

  private async _verifyCategoriesExist(categoryIds: string[]): Promise<void> {
    const existingCount = await this._categoryModel.countDocuments({
      _id: { $in: categoryIds },
    });
    if (existingCount !== categoryIds.length)
      throw new BadRequestException(
        "Invalid categories. DB integrity failure. 1 or more category IDs don't exist in DB",
      );
  }

  async create(
    createBrandDto: CreateBrandDto,
    logoUrl: string,
    adminId: Types.ObjectId,
  ) {
    await this._verifyCategoriesExist(createBrandDto.categories);

    const newBrand = new this._brandModel({
      ...createBrandDto,
      createdBy: adminId,
      logo: logoUrl,
    });

    return (await newBrand.save()).populate("categories");
  }

  findAll() {
    return this._brandModel
      .find()
      .populate("categories", "name logo")
      .populate("createdBy", "firstName lastName email");
  }

  async findOne(id: Types.ObjectId) {
    const brand = await this._brandModel
      .findById(id)
      .populate("categories", "name logo")
      .populate("createdBy", "firstName lastName email");

    if (!brand) throw new NotFoundException(`Brand ID: ${id} not found`);

    return brand;
  }

  async update(
    id: Types.ObjectId,
    updateBrandDto: UpdateBrandDto,
    logoUrl?: string,
  ) {
    if (updateBrandDto.categories)
      await this._verifyCategoriesExist(updateBrandDto.categories);

    const updatedBrand = await this._brandModel.findByIdAndUpdate(
      id,
      {
        ...updateBrandDto,
        ...(logoUrl && { logo: logoUrl }),
        $inc: { __v: 1 },
      },
      { returnDocument: "after" },
    );

    if (!updatedBrand) throw new NotFoundException(`Brand ID: ${id} ont found`);

    return updatedBrand;
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}
