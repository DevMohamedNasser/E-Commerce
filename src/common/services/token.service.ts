import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { RoleEnum } from "../enums/user.enum";
import { TokenTypeEnum } from "../enums/tokenType.enum";

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokens(
    userId: string,
    role: string,
  ): Promise<Record<string, string>> {
    const payload = { sub: userId };

    const secret = {
      access: this.configService.get<string>(
        role.toUpperCase() === RoleEnum.Admin
          ? "ACCESS_TOKEN_ADMIN_SECRET"
          : "ACCESS_TOKEN_USER_SECRET",
      ),
      refresh: this.configService.get<string>(
        role.toUpperCase() === RoleEnum.Admin
          ? "REFRESH_TOKEN_ADMIN_SECRET"
          : "REFRESH_TOKEN_USER_SECRET",
      ),
    };
    const expiresIn = {
      access: this.configService.get<string>(
        role.toUpperCase() === RoleEnum.Admin
          ? "ACCESS_TOKEN_ADMIN_EXPIRES_IN"
          : "ACCESS_TOKEN_USER_EXPIRES_IN",
      ),
      refresh: this.configService.get<string>(
        role.toUpperCase() === RoleEnum.Admin
          ? "REFRESH_TOKEN_ADMIN_EXPIRES_IN"
          : "REFRESH_TOKEN_USER_EXPIRES_IN",
      ),
    };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: secret.access,
        expiresIn: expiresIn.access as any,
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: secret.refresh,
        expiresIn: expiresIn.refresh as any,
      }),
    };
  }

  async verifyToken(
    token: string,
    role: string,
    tokenType: TokenTypeEnum = TokenTypeEnum.Access,
  ): Promise<any> {
    try {
      const secret = {
        access: this.configService.get<string>(
          role.toUpperCase() === RoleEnum.Admin
            ? "ACCESS_TOKEN_ADMIN_SECRET"
            : "ACCESS_TOKEN_USER_SECRET",
        ),
        refresh: this.configService.get<string>(
          role.toUpperCase() === RoleEnum.Admin
            ? "REFRESH_TOKEN_ADMIN_SECRET"
            : "REFRESH_TOKEN_USER_SECRET",
        ),
      };

      const options: any = {
        secret:
          tokenType === TokenTypeEnum.Access ? secret.access : secret.refresh,
      };

      return await this.jwtService.verifyAsync(token, options);
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid or expired token. ${(error as Error).message}`,
      );
    }
  }
}
