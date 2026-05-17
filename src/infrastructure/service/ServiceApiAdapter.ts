import type { IServiceRepository } from "@domain/service/IServiceRepository";
import type { Service } from "@domain/service/Service";
import { httpClient } from "@core/api/http-client";

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { total: number; page: number; page_size: number; pages: number };
}

interface ServiceDto {
  service_id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
}

export class ServiceApiAdapter implements IServiceRepository {
  async listByBusiness(businessId: string): Promise<Service[]> {
    const res = await httpClient.get<PaginatedResponse<ServiceDto>>(
      `/api/v1/businesses/${businessId}/services`,
    );
    return res.data.map((dto) => ({
      id: dto.service_id,
      businessId,
      name: dto.name,
      durationMinutes: dto.duration_minutes,
      price: dto.price,
      isActive: dto.is_active,
    }));
  }
}
