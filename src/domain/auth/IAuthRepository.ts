import type { AuthToken } from "./AuthToken";
import type { User } from "./User";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  token: AuthToken;
  user: User;
}

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResult>;
  refresh(refreshToken: string): Promise<AuthToken>;
  logout(refreshToken: string): Promise<void>;
  me(): Promise<User>;
}
