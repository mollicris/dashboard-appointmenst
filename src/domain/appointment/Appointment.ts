import type { AppointmentStatus } from "./AppointmentStatus";

export interface Appointment {
  readonly id: string;
  readonly businessId: string;
  readonly serviceId: string;
  readonly serviceName: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly professionalId: string | null;
  readonly professionalName: string | null;
  readonly scheduledAt: Date;
  readonly durationMinutes: number;
  readonly endsAt: Date;
  readonly status: AppointmentStatus;
  readonly notes: string | null;
  readonly cancelledReason: string | null;
  readonly cancelledAt: Date | null;
  readonly createdAt: Date;
}

export function isActive(apt: Appointment): boolean {
  return (
    apt.status === "pending" ||
    apt.status === "confirmed" ||
    apt.status === "rescheduled"
  );
}
