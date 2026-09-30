import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { categoryModel } from '../DB/models/category.model';
import { TokenService } from '../common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { userModel } from '../DB/models/user.model';
import { brandModel } from '../DB/models/brand.model';

@Module({
  imports: [categoryModel, userModel, brandModel],
  controllers: [BrandController],
  providers: [BrandService, TokenService, JwtService],
})
export class BrandModule {}
