import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { RoleEnum } from "../enums/user.enum";
import { Request } from "express";

@Injectable()
export class AdminAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const user = request["user"];
    if (!user) throw new ForbiddenException("User not authenticated");

    if (user.role !== RoleEnum.Admin)
      throw new ForbiddenException("Only admin can do this !!!");

    return true;
  }
}
