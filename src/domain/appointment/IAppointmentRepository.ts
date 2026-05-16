import type { Appointment } from "./Appointment";

export interface ListAppointmentsFilter {
  businessId: string;
  onDate?: string;
  page?: number;
  pageSize?: number;
}

export interface AppointmentsPage {
  items: Appointment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AvailableSlot {
  date: string;
  slots: string[];
  serviceDurationMinutes: number;
}

export interface IAppointmentRepository {
  list(filter: ListAppointmentsFilter): Promise<AppointmentsPage>;
  cancel(appointmentId: string, reason?: string): Promise<void>;
  getAvailableSlots(
    businessId: string,
    serviceId: string,
    date: string,
    professionalId?: string,
  ): Promise<AvailableSlot>;
}
