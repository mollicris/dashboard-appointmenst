import type { IAuthRepository } from "@domain/auth/IAuthRepository";

export class LogoutUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(refreshToken: string): Promise<void> {
    await this.repo.logout(refreshToken);
  }
}
