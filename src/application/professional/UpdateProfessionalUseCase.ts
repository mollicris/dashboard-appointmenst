import type { IProfessionalRepository } from "@domain/professional/IProfessionalRepository";
import type { Professional, UpdateProfessionalPayload } from "@domain/professional/Professional";

export class UpdateProfessionalUseCase {
  constructor(private readonly repo: IProfessionalRepository) {}

  execute(businessId: string, professionalId: string, payload: UpdateProfessionalPayload): Promise<Professional> {
    return this.repo.update(businessId, professionalId, payload);
  }
}
