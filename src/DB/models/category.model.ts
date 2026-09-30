import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, Schema as MongooseSchema } from "mongoose";

@Schema({
  timestamps: true,
})
export class Category {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    minLength: 2,
    maxLength: 20,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  logo: true;

  @Prop({
    types: MongooseSchema.Types.ObjectId,
    required: true,
    ref: "User",
  })
  createdBy: string;
}

export const categorySchema = SchemaFactory.createForClass(Category);

export type HCategoryDocument = HydratedDocument<Category>;
export const categoryModel = MongooseModule.forFeature([
  { name: Category.name, schema: categorySchema },
]);
