import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { categoryModel } from '../DB/models/category.model';
import { TokenService } from '../common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { userModel } from '../DB/models/user.model';

@Module({
  imports: [categoryModel, userModel],
  controllers: [CategoryController],
  providers: [CategoryService, TokenService, JwtService],
})
export class CategoryModule {}
