import type {
  IAppointmentRepository,
  ListAppointmentsFilter,
  AppointmentsPage,
} from "@domain/appointment/IAppointmentRepository";

export class ListAppointmentsUseCase {
  constructor(private readonly repo: IAppointmentRepository) {}

  async execute(filter: ListAppointmentsFilter): Promise<AppointmentsPage> {
    return this.repo.list(filter);
  }
}
