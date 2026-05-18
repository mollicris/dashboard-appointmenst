import type { IServiceRepository } from "@domain/service/IServiceRepository";
import type { CreateServicePayload, Service } from "@domain/service/Service";

export class CreateServiceUseCase {
  constructor(private readonly repo: IServiceRepository) {}

  async execute(businessId: string, payload: CreateServicePayload): Promise<Service> {
    return this.repo.create(businessId, payload);
  }
}
