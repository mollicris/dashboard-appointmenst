import type { IBusinessRepository } from "@domain/business/IBusinessRepository";
import type { Business } from "@domain/business/Business";

export class ListBusinessesUseCase {
  constructor(private readonly repo: IBusinessRepository) {}

  async execute(): Promise<Business[]> {
    return this.repo.list();
  }
}
