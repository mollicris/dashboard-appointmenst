import type { IBusinessRepository } from "@domain/business/IBusinessRepository";
import type { Business } from "@domain/business/Business";

export class GetBusinessUseCase {
  constructor(private readonly repo: IBusinessRepository) {}

  execute(id: string): Promise<Business | null> {
    return this.repo.getById(id);
  }
}
