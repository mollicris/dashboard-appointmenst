import type { IProfessionalRepository } from "@domain/professional/IProfessionalRepository";
import type { Professional } from "@domain/professional/Professional";

export class ListProfessionalsUseCase {
  constructor(private readonly repo: IProfessionalRepository) {}

  execute(businessId: string): Promise<Professional[]> {
    return this.repo.listByBusiness(businessId);
  }
}
