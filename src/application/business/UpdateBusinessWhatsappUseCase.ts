import type { IBusinessRepository } from "@domain/business/IBusinessRepository";
import type { Business, UpdateWhatsappPayload } from "@domain/business/Business";

export class UpdateBusinessWhatsappUseCase {
  constructor(private readonly repo: IBusinessRepository) {}

  execute(businessId: string, payload: UpdateWhatsappPayload): Promise<Business> {
    return this.repo.updateWhatsapp(businessId, payload);
  }
}
