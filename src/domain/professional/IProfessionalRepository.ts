import type { CreateProfessionalPayload, Professional, UpdateProfessionalPayload } from "./Professional";

export interface IProfessionalRepository {
  listByBusiness(businessId: string): Promise<Professional[]>;
  create(businessId: string, payload: CreateProfessionalPayload): Promise<Professional>;
  update(businessId: string, professionalId: string, payload: UpdateProfessionalPayload): Promise<Professional>;
  delete(businessId: string, professionalId: string): Promise<void>;
}
