import type { IAuthRepository, LoginCredentials, LoginResult } from "@domain/auth/IAuthRepository";
import { DomainError } from "@domain/shared/DomainError";

export class LoginUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<LoginResult> {
    if (!credentials.email.trim() || !credentials.password) {
      throw new DomainError("Email y contraseña son requeridos");
    }
    return this.repo.login(credentials);
  }
}
