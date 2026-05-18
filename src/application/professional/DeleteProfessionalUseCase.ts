import type { IProfessionalRepository } from "@domain/professional/IProfessionalRepository";

export class DeleteProfessionalUseCase {
  constructor(private readonly repo: IProfessionalRepository) {}

  execute(businessId: string, professionalId: string): Promise<void> {
    return this.repo.delete(businessId, professionalId);
  }
}
