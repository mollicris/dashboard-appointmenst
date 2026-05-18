import type { IProfessionalRepository } from "@domain/professional/IProfessionalRepository";
import type { CreateProfessionalPayload, Professional, UpdateProfessionalPayload } from "@domain/professional/Professional";
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

interface ProfessionalDto {
  professional_id: string;
  business_id?: string;
  user_id?: string | null;
  name: string;
  phone: string | null;
  is_active: boolean;
}

function toProfessional(dto: ProfessionalDto, businessId: string): Professional {
  return {
    id: dto.professional_id,
    businessId: dto.business_id ?? businessId,
    userId: dto.user_id ?? null,
    name: dto.name,
    phone: dto.phone,
    isActive: dto.is_active,
  };
}

export class ProfessionalApiAdapter implements IProfessionalRepository {
  async listByBusiness(businessId: string): Promise<Professional[]> {
    const res = await httpClient.get<PaginatedResponse<ProfessionalDto>>(
      `/api/v1/businesses/${businessId}/professionals`,
    );
    return res.data.map((dto) => toProfessional(dto, businessId));
  }

  async create(businessId: string, payload: CreateProfessionalPayload): Promise<Professional> {
    const res = await httpClient.post<SuccessResponse<ProfessionalDto>>(
      `/api/v1/businesses/${businessId}/professionals`,
      {
        name: payload.name,
        phone: payload.phone ?? null,
      },
    );
    return toProfessional(res.data, businessId);
  }

  async update(businessId: string, professionalId: string, payload: UpdateProfessionalPayload): Promise<Professional> {
    const res = await httpClient.put<SuccessResponse<ProfessionalDto>>(
      `/api/v1/businesses/${businessId}/professionals/${professionalId}`,
      {
        name: payload.name,
        phone: payload.phone,
      },
    );
    return toProfessional(res.data, businessId);
  }

  async delete(businessId: string, professionalId: string): Promise<void> {
    await httpClient.delete(`/api/v1/businesses/${businessId}/professionals/${professionalId}`);
  }
}
