import type { IBusinessRepository } from "@domain/business/IBusinessRepository";
import type { Business } from "@domain/business/Business";
import { httpClient } from "@core/api/http-client";
import { ApiError } from "@core/api/http-client";

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { total: number; page: number; page_size: number; pages: number };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface BusinessSummaryDto {
  business_id: string;
  name: string;
  slug: string;
  phone: string;
  is_active: boolean;
}

interface BusinessDetailDto extends BusinessSummaryDto {
  email: string | null;
  address: string | null;
  description: string | null;
  timezone: string;
}

function toBusinessDomain(dto: BusinessSummaryDto): Business {
  return {
    id: dto.business_id,
    name: dto.name,
    slug: dto.slug,
    phone: dto.phone,
    email: (dto as BusinessDetailDto).email ?? null,
    isActive: dto.is_active,
  };
}

export class BusinessApiAdapter implements IBusinessRepository {
  async list(): Promise<Business[]> {
    const res = await httpClient.get<PaginatedResponse<BusinessSummaryDto>>("/api/v1/businesses");
    return res.data.map(toBusinessDomain);
  }

  async getById(id: string): Promise<Business | null> {
    try {
      const res = await httpClient.get<ApiResponse<BusinessDetailDto>>(`/api/v1/businesses/${id}`);
      return toBusinessDomain(res.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }
}
