import { httpClient } from "@core/api/http-client";

export interface DaySchedule {
  day_of_week: number; // 0=Monday, 6=Sunday
  day_name: string;
  open_at: string; // HH:MM format
  close_at: string; // HH:MM format
  is_closed: boolean;
}

export interface BusinessHoursResponse {
  business_id: string;
  schedule: DaySchedule[];
}

export interface SetScheduleRequest {
  schedule: Array<{
    day_of_week: number;
    open_at: string;
    close_at: string;
    is_closed: boolean;
  }>;
}

export const businessHoursApi = {
  async getHours(businessId: string): Promise<BusinessHoursResponse> {
    const response = await httpClient.get<{ data: BusinessHoursResponse }>(
      `/api/v1/businesses/${businessId}/hours`,
    );
    return response.data;
  },

  async setHours(businessId: string, schedule: SetScheduleRequest): Promise<BusinessHoursResponse> {
    const response = await httpClient.put<{ data: BusinessHoursResponse }>(
      `/api/v1/businesses/${businessId}/hours`,
      schedule,
    );
    return response.data;
  },

  async updateDayHours(
    businessId: string,
    dayOfWeek: number,
    data: {
      open_at?: string;
      close_at?: string;
      is_closed?: boolean;
    },
  ): Promise<DaySchedule> {
    const response = await httpClient.patch<{ data: DaySchedule }>(
      `/api/v1/businesses/${businessId}/hours/${dayOfWeek}`,
      data,
    );
    return response.data;
  },
};
