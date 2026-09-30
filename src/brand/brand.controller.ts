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
import { BrandService } from "./brand.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { AuthGuard } from "../common/guards/auth.guard";
import { AdminAuthGuard } from "../common/guards/adminAuth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "../common/utils/multer.util";
import { Request } from "express";
import { Types } from "mongoose";

@Controller("api/v1/brand")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(AuthGuard, AdminAuthGuard)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException("Brand logo is required");

    const logoUrl = `http://127.0.0.1:${process.env.PORT}/${file.path.replace(/\\/g, "/")}`;
    const adminId = req.user?._id as unknown as Types.ObjectId;

    return this.brandService.create(createBrandDto, logoUrl, adminId);
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: Types.ObjectId) {
    return this.brandService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard, AdminAuthGuard)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  update(
    @UploadedFile() file: Express.Multer.File,
    @Param("id") id: Types.ObjectId,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    let logoUrl: string | undefined;
    if (file)
      logoUrl = `http://127.0.0.1:${process.env.PORT}/${file.path.replace(/\\/g, "/")}`;

    return this.brandService.update(id, updateBrandDto, logoUrl);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.brandService.remove(+id);
  }
}
