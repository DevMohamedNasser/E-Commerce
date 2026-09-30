import { BadRequestException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface.js";
import { Request } from "express";
import { diskStorage } from "multer";
import { extname } from "path";

export const multerOptions: MulterOptions = {
  storage: diskStorage({
    destination: "./uploads",
    filename: (req: Request, file: Express.Multer.File, cb: any) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.originalname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.match(/\/(png|jpg|jpeg|webp)$/)) cb(null, true);
    else cb(new BadRequestException("Unsupported file format!!!"));
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
