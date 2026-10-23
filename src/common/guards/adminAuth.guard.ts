import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { RoleEnum } from "../enums/user.enum";
import { Request } from "express";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AdminAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request = context.switchToHttp().getRequest<Request>();

    if (!request) {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    }

    const user = request["user"];
    if (!user) throw new ForbiddenException("User not authenticated");

    if (user.role !== RoleEnum.Admin)
      throw new ForbiddenException("Only admin can do this !!!");

    return true;
  }
}
