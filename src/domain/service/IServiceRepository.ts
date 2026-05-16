import type { Service } from "./Service";

export interface IServiceRepository {
  listByBusiness(businessId: string): Promise<Service[]>;
}
