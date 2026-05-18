import type { IServiceRepository } from "@domain/service/IServiceRepository";

export class DeleteServiceUseCase {
  constructor(private readonly repo: IServiceRepository) {}

  async execute(businessId: string, serviceId: string): Promise<void> {
    return this.repo.delete(businessId, serviceId);
  }
}
