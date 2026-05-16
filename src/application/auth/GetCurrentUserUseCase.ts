import type { IAuthRepository } from "@domain/auth/IAuthRepository";
import type { User } from "@domain/auth/User";

export class GetCurrentUserUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(): Promise<User> {
    return this.repo.me();
  }
}
