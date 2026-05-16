import type { IAppointmentRepository } from "@domain/appointment/IAppointmentRepository";

export class CancelAppointmentUseCase {
  constructor(private readonly repo: IAppointmentRepository) {}

  async execute(appointmentId: string, reason?: string): Promise<void> {
    await this.repo.cancel(appointmentId, reason);
  }
}
