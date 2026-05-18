import type { IServiceRepository } from "@domain/service/IServiceRepository";
import type { Service, UpdateServicePayload } from "@domain/service/Service";

export class UpdateServiceUseCase {
  constructor(private readonly repo: IServiceRepository) {}

  async execute(businessId: string, serviceId: string, payload: UpdateServicePayload): Promise<Service> {
    return this.repo.update(businessId, serviceId, payload);
  }
}
