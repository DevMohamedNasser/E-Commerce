import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { TokenService } from "../services/token.service";
import { RoleEnum } from "../enums/user.enum";
import { InjectModel } from "@nestjs/mongoose";
import { HUserDocument, User } from "../../DB/models/user.model";
import { Model } from "mongoose";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly _tokenService: TokenService,
    @InjectModel(User.name) private readonly _userModel: Model<HUserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader)
      throw new UnauthorizedException("Authorization header is missing");

    const [bearer, token] = authHeader.split(" ") || [];

    if (
      !bearer ||
      (bearer.toUpperCase() !== RoleEnum.User &&
        bearer.toUpperCase() !== RoleEnum.Admin)
    )
      throw new UnauthorizedException("Invalid authorization header format!!!");

    const payload = await this._tokenService.verifyToken(token, bearer);

    const user = await this._userModel.findById(payload.sub);
    if (!user) throw new NotFoundException("User not found!!!");

    request["user"] = user;

    return true;
  }
}
