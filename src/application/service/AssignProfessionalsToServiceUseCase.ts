import type { IServiceRepository } from "@domain/service/IServiceRepository";

export class AssignProfessionalsToServiceUseCase {
  constructor(private readonly repo: IServiceRepository) {}

  execute(businessId: string, serviceId: string, professionalIds: string[]): Promise<string[]> {
    return this.repo.assignProfessionals(businessId, serviceId, professionalIds);
  }
}
