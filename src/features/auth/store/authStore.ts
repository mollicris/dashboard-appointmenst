import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@domain/auth/User";
import type { AuthToken } from "@domain/auth/AuthToken";
import { TokenStorage } from "@infrastructure/auth/TokenStorage";
import { httpClient } from "@core/api/http-client";
import { container } from "@infrastructure/di/container";

interface AuthState {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  setAuth: (token: AuthToken, user: User) => void;
  clearAuth: () => void;
  rehydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        TokenStorage.save({
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expiresAt: token.expiresAt,
          tenantId: token.tenantId,
          userId: token.userId,
        });
        httpClient.setTokenProvider(() => TokenStorage.getAccessToken());
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        TokenStorage.clear();
        httpClient.setTokenProvider(() => null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      rehydrate: async () => {
        const accessToken = TokenStorage.getAccessToken();
        if (!accessToken) return;
        httpClient.setTokenProvider(() => accessToken);
        try {
          const user = await container.getCurrentUserUseCase.execute();
          set({ user, isAuthenticated: true });
        } catch {
          TokenStorage.clear();
          httpClient.setTokenProvider(() => null);
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

// Re-attach token provider on page reload
httpClient.setTokenProvider(() => TokenStorage.getAccessToken());
