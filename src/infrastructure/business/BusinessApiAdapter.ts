import type { IBusinessRepository } from "@domain/business/IBusinessRepository";
import type { Business } from "@domain/business/Business";
import { httpClient } from "@core/api/http-client";
import { ApiError } from "@core/api/http-client";

interface ApiPageResponse<T> {
  success: boolean;
  data: T[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface BusinessDto {
  id: string;
  tenant_id: string;
  name: string;
  industry: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
}

function toBusinessDomain(dto: BusinessDto): Business {
  return {
    id: dto.id,
    tenantId: dto.tenant_id,
    name: dto.name,
    industry: dto.industry,
    phone: dto.phone,
    email: dto.email,
    isActive: dto.is_active,
  };
}

export class BusinessApiAdapter implements IBusinessRepository {
  async list(): Promise<Business[]> {
    const res = await httpClient.get<ApiPageResponse<BusinessDto>>("/api/v1/businesses");
    return res.data.map(toBusinessDomain);
  }

  async getById(id: string): Promise<Business | null> {
    try {
      const res = await httpClient.get<ApiResponse<BusinessDto>>(`/api/v1/businesses/${id}`);
      return toBusinessDomain(res.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }
}
