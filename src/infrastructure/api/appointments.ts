import { httpClient } from "@core/api/http-client";

export interface AvailableSlotsResponse {
  data: {
    slots: string[];
    date: string;
    service_duration_minutes: number;
  };
}

export interface CreateAppointmentRequest {
  business_id: string;
  service_id: string;
  scheduled_at: string;
  client_name: string;
  client_whatsapp: string;
  professional_id?: string;
  notes?: string;
  client_email?: string;
}

export const appointmentsApi = {
  async create(data: CreateAppointmentRequest): Promise<{ data: { appointment_id: string } }> {
    return httpClient.post<{ data: { appointment_id: string } }>("/api/v1/appointments", data);
  },

  async getAvailableSlots(
    businessId: string,
    serviceId: string,
    onDate: string,
    professionalId?: string
  ): Promise<AvailableSlotsResponse> {
    const params = new URLSearchParams({
      business_id: businessId,
      service_id: serviceId,
      on_date: onDate,
    });
    if (professionalId) {
      params.append("professional_id", professionalId);
    }
    return httpClient.get<AvailableSlotsResponse>(`/api/v1/appointments/availability?${params}`);
  },

  async reschedule(appointmentId: string, newTime: Date): Promise<void> {
    await httpClient.patch(`/api/v1/appointments/${appointmentId}/reschedule`, {
      new_scheduled_at: newTime.toISOString(),
    });
  },
};
