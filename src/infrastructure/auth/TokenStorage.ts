const ACCESS_KEY = "auth:access_token";
const REFRESH_KEY = "auth:refresh_token";
const EXPIRES_KEY = "auth:expires_at";
const TENANT_KEY = "auth:tenant_id";
const USER_KEY = "auth:user_id";

export interface StoredTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tenantId: string;
  userId: string;
}

export const TokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_KEY),
  getTenantId: (): string | null => localStorage.getItem(TENANT_KEY),
  getUserId: (): string | null => localStorage.getItem(USER_KEY),

  isExpired: (): boolean => {
    const exp = localStorage.getItem(EXPIRES_KEY);
    if (!exp) return true;
    return new Date() >= new Date(exp);
  },

  save: (data: StoredTokenData): void => {
    localStorage.setItem(ACCESS_KEY, data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    localStorage.setItem(EXPIRES_KEY, data.expiresAt.toISOString());
    localStorage.setItem(TENANT_KEY, data.tenantId);
    localStorage.setItem(USER_KEY, data.userId);
  },

  clear: (): void => {
    [ACCESS_KEY, REFRESH_KEY, EXPIRES_KEY, TENANT_KEY, USER_KEY].forEach((k) =>
      localStorage.removeItem(k),
    );
  },
};
