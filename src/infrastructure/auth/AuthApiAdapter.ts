import type { IAuthRepository, LoginCredentials, LoginResult } from "@domain/auth/IAuthRepository";
import type { AuthToken } from "@domain/auth/AuthToken";
import type { User, UserRole } from "@domain/auth/User";
import { httpClient } from "@core/api/http-client";
import { decodeJwt } from "./jwt-decode";

interface TokenDto {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: string;
  tenant_id: string;
  user_id: string;
}

interface MeDto {
  user_id: string;
  tenant_id: string;
  email: string;
  role: string;
}

function toAuthToken(dto: TokenDto): AuthToken {
  return {
    accessToken: dto.access_token,
    refreshToken: dto.refresh_token,
    tokenType: dto.token_type,
    expiresAt: new Date(dto.expires_at),
    tenantId: dto.tenant_id,
    userId: dto.user_id,
  };
}

export class AuthApiAdapter implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const dto = await httpClient.post<TokenDto>("/api/v1/auth/login", credentials);
    const token = toAuthToken(dto);
    const claims = decodeJwt(token.accessToken);
    const user: User = {
      id: claims.sub,
      tenantId: claims.tenant_id,
      email: claims.email,
      role: claims.role as UserRole,
    };
    return { token, user };
  }

  async refresh(refreshToken: string): Promise<AuthToken> {
    const dto = await httpClient.post<TokenDto>("/api/v1/auth/refresh", {
      refresh_token: refreshToken,
    });
    return toAuthToken(dto);
  }

  async logout(refreshToken: string): Promise<void> {
    await httpClient.post("/api/v1/auth/logout", { refresh_token: refreshToken });
  }

  async me(): Promise<User> {
    const dto = await httpClient.get<MeDto>("/api/v1/auth/me");
    return {
      id: dto.user_id,
      tenantId: dto.tenant_id,
      email: dto.email,
      role: dto.role as User["role"],
    };
  }
}
