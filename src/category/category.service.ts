import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Category, HCategoryDocument } from "../DB/models/category.model";
import { Model } from "mongoose";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly _categoryModel: Model<HCategoryDocument>,
  ) {}

  create(
    createCategoryDto: CreateCategoryDto,
    logoUrl: string,
    adminId: string,
  ) {
    const newCategory = new this._categoryModel({
      ...createCategoryDto,
      createdBy: adminId,
      logo: logoUrl,
    });

    return newCategory.save();
  }

  findAll() {
    return this._categoryModel.find();
  }

  async findOne(id: string) {
    const category = await this._categoryModel.findById(id);
    if (!category) throw new NotFoundException("Category not found");

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    logoUrl?: string,
  ) {
    const category = await this._categoryModel.findOneAndUpdate(
      { _id: id },
      {
        ...updateCategoryDto,
        $inc: { __v: 1 },
        ...(logoUrl && { logo: logoUrl }),
      },
      { returnDocument: "after" },
    ).populate("createdBy");

    if (!category) throw new NotFoundException("Category not found");

    return category;
  }

  remove(id: string) {
    return this._categoryModel.deleteOne({ _id: id });
  }
}
