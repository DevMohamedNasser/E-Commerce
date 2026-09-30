import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { AuthGuard } from "../common/guards/auth.guard";
import { AdminAuthGuard } from "../common/guards/adminAuth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "../common/utils/multer.util";
import { Request } from "express";

@Controller("/api/v1/category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard, AdminAuthGuard)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException("Category logo is required");

    const logoUrl = `http://127.0.0.1:${process.env.PORT}/${file.path.replace(/\\/g, "/")}`;
    const adminId = req.user?._id as unknown as string;
    return this.categoryService.create(createCategoryDto, logoUrl, adminId);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard, AdminAuthGuard)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let logoUrl = undefined;
    if (file) logoUrl = `http://127.0.0.1:3000/${file.path}`;
    return this.categoryService.update(id, updateCategoryDto, file && logoUrl);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, AdminAuthGuard)
  remove(@Param("id") id: string) {
    return this.categoryService.remove(id);
  }
}
