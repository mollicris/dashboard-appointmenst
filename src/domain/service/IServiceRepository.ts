import type { CreateServicePayload, Service, UpdateServicePayload } from "./Service";

export interface IServiceRepository {
  listByBusiness(businessId: string): Promise<Service[]>;
  create(businessId: string, payload: CreateServicePayload): Promise<Service>;
  update(businessId: string, serviceId: string, payload: UpdateServicePayload): Promise<Service>;
  delete(businessId: string, serviceId: string): Promise<void>;
  assignProfessionals(businessId: string, serviceId: string, professionalIds: string[]): Promise<string[]>;
}
