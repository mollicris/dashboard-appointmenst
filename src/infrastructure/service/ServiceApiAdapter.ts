import type { IServiceRepository } from "@domain/service/IServiceRepository";
import type { CreateServicePayload, Service, UpdateServicePayload } from "@domain/service/Service";
import { httpClient } from "@core/api/http-client";

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { total: number; page: number; page_size: number; pages: number };
}

interface SuccessResponse<T> {
  success: boolean;
  message: string;
  code: string;
  data: T;
}

interface ServiceDto {
  service_id: string;
  business_id?: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
  professional_ids?: string[];
}

interface AssignProfessionalsDto {
  service_id: string;
  professional_ids: string[];
}

function toService(dto: ServiceDto, businessId: string): Service {
  return {
    id: dto.service_id,
    businessId: dto.business_id ?? businessId,
    name: dto.name,
    description: dto.description ?? null,
    durationMinutes: dto.duration_minutes,
    price: dto.price,
    isActive: dto.is_active,
    professionalIds: dto.professional_ids ?? [],
  };
}

export class ServiceApiAdapter implements IServiceRepository {
  async listByBusiness(businessId: string): Promise<Service[]> {
    const res = await httpClient.get<PaginatedResponse<ServiceDto>>(
      `/api/v1/businesses/${businessId}/services`,
    );
    return res.data.map((dto) => toService(dto, businessId));
  }

  async create(businessId: string, payload: CreateServicePayload): Promise<Service> {
    const res = await httpClient.post<SuccessResponse<ServiceDto>>(
      `/api/v1/businesses/${businessId}/services`,
      {
        name: payload.name,
        duration_minutes: payload.durationMinutes,
        description: payload.description ?? null,
        price: payload.price ?? null,
      },
    );
    return toService(res.data, businessId);
  }

  async update(businessId: string, serviceId: string, payload: UpdateServicePayload): Promise<Service> {
    const res = await httpClient.put<SuccessResponse<ServiceDto>>(
      `/api/v1/businesses/${businessId}/services/${serviceId}`,
      {
        name: payload.name,
        duration_minutes: payload.durationMinutes,
        description: payload.description,
        price: payload.price,
      },
    );
    return toService(res.data, businessId);
  }

  async delete(businessId: string, serviceId: string): Promise<void> {
    await httpClient.delete(`/api/v1/businesses/${businessId}/services/${serviceId}`);
  }

  async assignProfessionals(
    businessId: string,
    serviceId: string,
    professionalIds: string[],
  ): Promise<string[]> {
    const res = await httpClient.put<SuccessResponse<AssignProfessionalsDto>>(
      `/api/v1/businesses/${businessId}/services/${serviceId}/professionals`,
      { professional_ids: professionalIds },
    );
    return res.data.professional_ids;
  }
}
