import type { IBusinessRepository } from "@domain/business/IBusinessRepository";
import type { Business, UpdateWhatsappPayload } from "@domain/business/Business";
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
  whatsapp_phone_number_id: string | null;
  owner_whatsapp: string | null;
  has_whatsapp_app_secret: boolean;
}

interface WhatsappConfigDto {
  business_id: string;
  whatsapp_phone_number_id: string | null;
  owner_whatsapp: string | null;
  has_whatsapp_app_secret: boolean;
}

function toBusinessDomain(dto: BusinessSummaryDto): Business {
  const detail = dto as Partial<BusinessDetailDto>;
  return {
    id: dto.business_id,
    name: dto.name,
    slug: dto.slug,
    phone: dto.phone,
    email: detail.email ?? null,
    isActive: dto.is_active,
    whatsappPhoneNumberId: detail.whatsapp_phone_number_id ?? null,
    ownerWhatsapp: detail.owner_whatsapp ?? null,
    hasWhatsappAppSecret: detail.has_whatsapp_app_secret ?? false,
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

  async updateWhatsapp(id: string, payload: UpdateWhatsappPayload): Promise<Business> {
    const res = await httpClient.patch<ApiResponse<WhatsappConfigDto>>(
      `/api/v1/businesses/${id}/whatsapp`,
      {
        phone_number_id: payload.phoneNumberId,
        app_secret: payload.appSecret,
        owner_whatsapp: payload.ownerWhatsapp,
      },
    );
    const dto = res.data;
    return {
      id,
      name: "",
      slug: "",
      phone: "",
      email: null,
      isActive: true,
      whatsappPhoneNumberId: dto.whatsapp_phone_number_id,
      ownerWhatsapp: dto.owner_whatsapp,
      hasWhatsappAppSecret: dto.has_whatsapp_app_secret,
    };
  }
}
