import type { IServiceRepository } from "@domain/service/IServiceRepository";
import type { Service } from "@domain/service/Service";

export class ListServicesUseCase {
  constructor(private readonly repo: IServiceRepository) {}

  async execute(businessId: string): Promise<Service[]> {
    return this.repo.listByBusiness(businessId);
  }
}
