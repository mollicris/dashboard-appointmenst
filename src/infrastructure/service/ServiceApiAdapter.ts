import type { IServiceRepository } from "@domain/service/IServiceRepository";
import type { Service } from "@domain/service/Service";
import { httpClient } from "@core/api/http-client";

interface ApiPageResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

interface ServiceDto {
  id: string;
  business_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export class ServiceApiAdapter implements IServiceRepository {
  async listByBusiness(businessId: string): Promise<Service[]> {
    const res = await httpClient.get<ApiPageResponse<ServiceDto>>("/api/v1/services", {
      business_id: businessId,
    });
    return res.data.map((dto) => ({
      id: dto.id,
      businessId: dto.business_id,
      name: dto.name,
      durationMinutes: dto.duration_minutes,
      price: dto.price,
      isActive: dto.is_active,
    }));
  }
}
