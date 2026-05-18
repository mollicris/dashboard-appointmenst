import type { IProfessionalRepository } from "@domain/professional/IProfessionalRepository";
import type { CreateProfessionalPayload, Professional } from "@domain/professional/Professional";

export class CreateProfessionalUseCase {
  constructor(private readonly repo: IProfessionalRepository) {}

  execute(businessId: string, payload: CreateProfessionalPayload): Promise<Professional> {
    return this.repo.create(businessId, payload);
  }
}
