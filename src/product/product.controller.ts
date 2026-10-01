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
  Req,
  UploadedFiles,
  BadRequestException,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AuthGuard } from "../common/guards/auth.guard";
import { AdminAuthGuard } from "../common/guards/adminAuth.guard";
import { FilesInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "../common/utils/multer.util";
import { Request } from "express";
import { Types } from "mongoose";

@Controller("api/v1/product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard, AdminAuthGuard)
  @UseInterceptors(FilesInterceptor("files", 10, multerOptions))
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files) throw new BadRequestException("Product images is required");

    const adminId = req.user?._id as Types.ObjectId;
    const imagesUrl: string[] = files.map(
      (file) =>
        `http://127.0.0.1:${process.env.PORT}/${file.path.replace(/\\/g, "/")}`,
    );

    return this.productService.create(createProductDto, imagesUrl, adminId);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: Types.ObjectId) {
    return this.productService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard, AdminAuthGuard)
  @UseInterceptors(FilesInterceptor("files", 10, multerOptions))
  update(
    @Param("id") id: Types.ObjectId,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const adminId = req.user?._id as Types.ObjectId;
    let imagesUrl: string[] | undefined;
    if (files)
      imagesUrl = files.map(
        (file) =>
          `http://127.0.0.1:${process.env.PORT}/${file.path.replace(/\\/g, "/")}`,
      );

    return this.productService.update(id, updateProductDto, imagesUrl);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, AdminAuthGuard)
  delete(@Param("id") id: Types.ObjectId) {
    return this.productService.delete(id);
  }
}
