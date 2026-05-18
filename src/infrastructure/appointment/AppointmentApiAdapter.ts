import type {
  IAppointmentRepository,
  ListAppointmentsFilter,
  AppointmentsPage,
  AvailableSlot,
} from "@domain/appointment/IAppointmentRepository";
import type { Appointment } from "@domain/appointment/Appointment";
import type { AppointmentStatus } from "@domain/appointment/AppointmentStatus";
import { httpClient } from "@core/api/http-client";

interface ApiPageResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface AppointmentDto {
  appointment_id: string;
  service_id: string;
  service_name: string;
  client_id: string;
  client_name: string;
  professional_id: string | null;
  professional_name: string | null;
  scheduled_at: string;
  duration_minutes: number;
  ends_at: string;
  status: string;
}

interface SlotsDto {
  slots: string[];
  date: string;
  service_duration_minutes: number;
}

function toAppointment(dto: AppointmentDto): Appointment {
  return {
    id: dto.appointment_id,
    businessId: "",
    serviceId: dto.service_id,
    serviceName: dto.service_name || "Unknown Service",
    clientId: dto.client_id,
    clientName: dto.client_name || "Unknown Client",
    professionalId: dto.professional_id,
    professionalName: dto.professional_name ?? null,
    scheduledAt: new Date(dto.scheduled_at),
    durationMinutes: dto.duration_minutes,
    endsAt: new Date(dto.ends_at),
    status: dto.status as AppointmentStatus,
    notes: null,
    cancelledReason: null,
    cancelledAt: null,
    createdAt: new Date(dto.scheduled_at),
  };
}

export class AppointmentApiAdapter implements IAppointmentRepository {
  async list(filter: ListAppointmentsFilter): Promise<AppointmentsPage> {
    const params: Record<string, unknown> = {
      business_id: filter.businessId,
      page: filter.page ?? 1,
      page_size: filter.pageSize ?? 20,
    };
    if (filter.onDate) params["on_date"] = filter.onDate;

    const res = await httpClient.get<ApiPageResponse<AppointmentDto>>(
      "/api/v1/appointments",
      params,
    );
    return {
      items: res.data.map(toAppointment),
      total: res.total,
      page: res.page,
      pageSize: res.page_size,
    };
  }

  async cancel(appointmentId: string, reason?: string): Promise<void> {
    await httpClient.patch(`/api/v1/appointments/${appointmentId}/cancel`, {
      reason: reason ?? null,
    });
  }

  async reschedule(appointmentId: string, newTime: Date): Promise<void> {
    await httpClient.patch(`/api/v1/appointments/${appointmentId}/reschedule`, {
      new_scheduled_at: newTime.toISOString(),
    });
  }

  async getAvailableSlots(
    businessId: string,
    serviceId: string,
    date: string,
    professionalId?: string,
  ): Promise<AvailableSlot> {
    const params: Record<string, unknown> = {
      business_id: businessId,
      service_id: serviceId,
      on_date: date,
    };
    if (professionalId) params["professional_id"] = professionalId;

    const res = await httpClient.get<ApiResponse<SlotsDto>>(
      "/api/v1/appointments/availability",
      params,
    );
    return {
      date: res.data.date,
      slots: res.data.slots,
      serviceDurationMinutes: res.data.service_duration_minutes,
    };
  }
}
