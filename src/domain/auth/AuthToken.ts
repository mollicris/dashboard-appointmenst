export interface AuthToken {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: string;
  readonly expiresAt: Date;
  readonly tenantId: string;
  readonly userId: string;
}

export function isTokenExpired(token: AuthToken): boolean {
  return new Date() >= token.expiresAt;
}
