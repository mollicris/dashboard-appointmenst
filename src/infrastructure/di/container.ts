import { AuthApiAdapter } from "@infrastructure/auth/AuthApiAdapter";
import { AppointmentApiAdapter } from "@infrastructure/appointment/AppointmentApiAdapter";
import { ServiceApiAdapter } from "@infrastructure/service/ServiceApiAdapter";
import { BusinessApiAdapter } from "@infrastructure/business/BusinessApiAdapter";
import { ConversationApiAdapter } from "@infrastructure/conversation/ConversationApiAdapter";
import { ProfessionalApiAdapter } from "@infrastructure/professional/ProfessionalApiAdapter";

import { LoginUseCase } from "@application/auth/LoginUseCase";
import { LogoutUseCase } from "@application/auth/LogoutUseCase";
import { GetCurrentUserUseCase } from "@application/auth/GetCurrentUserUseCase";
import { ListAppointmentsUseCase } from "@application/appointment/ListAppointmentsUseCase";
import { CancelAppointmentUseCase } from "@application/appointment/CancelAppointmentUseCase";
import { ListServicesUseCase } from "@application/service/ListServicesUseCase";
import { CreateServiceUseCase } from "@application/service/CreateServiceUseCase";
import { UpdateServiceUseCase } from "@application/service/UpdateServiceUseCase";
import { DeleteServiceUseCase } from "@application/service/DeleteServiceUseCase";
import { AssignProfessionalsToServiceUseCase } from "@application/service/AssignProfessionalsToServiceUseCase";
import { ListBusinessesUseCase } from "@application/business/ListBusinessesUseCase";
import { GetBusinessUseCase } from "@application/business/GetBusinessUseCase";
import { UpdateBusinessWhatsappUseCase } from "@application/business/UpdateBusinessWhatsappUseCase";
import { ListConversationsUseCase } from "@application/conversation/ListConversationsUseCase";
import { GetConversationMessagesUseCase } from "@application/conversation/GetConversationMessagesUseCase";
import { ListProfessionalsUseCase } from "@application/professional/ListProfessionalsUseCase";
import { CreateProfessionalUseCase } from "@application/professional/CreateProfessionalUseCase";
import { UpdateProfessionalUseCase } from "@application/professional/UpdateProfessionalUseCase";
import { DeleteProfessionalUseCase } from "@application/professional/DeleteProfessionalUseCase";

// ── Infrastructure (adapters — implement domain ports) ────────────────────────
const authRepo = new AuthApiAdapter();
const appointmentRepo = new AppointmentApiAdapter();
const serviceRepo = new ServiceApiAdapter();
const businessRepo = new BusinessApiAdapter();
const conversationRepo = new ConversationApiAdapter();
const professionalRepo = new ProfessionalApiAdapter();

// ── Application (use cases — depend on ports, not adapters) ──────────────────
export const container = {
  // Auth
  loginUseCase: new LoginUseCase(authRepo),
  logoutUseCase: new LogoutUseCase(authRepo),
  getCurrentUserUseCase: new GetCurrentUserUseCase(authRepo),
  // Appointments
  listAppointmentsUseCase: new ListAppointmentsUseCase(appointmentRepo),
  cancelAppointmentUseCase: new CancelAppointmentUseCase(appointmentRepo),
  // Services
  listServicesUseCase: new ListServicesUseCase(serviceRepo),
  createServiceUseCase: new CreateServiceUseCase(serviceRepo),
  updateServiceUseCase: new UpdateServiceUseCase(serviceRepo),
  deleteServiceUseCase: new DeleteServiceUseCase(serviceRepo),
  assignProfessionalsToServiceUseCase: new AssignProfessionalsToServiceUseCase(serviceRepo),
  // Businesses
  listBusinessesUseCase: new ListBusinessesUseCase(businessRepo),
  getBusinessUseCase: new GetBusinessUseCase(businessRepo),
  updateBusinessWhatsappUseCase: new UpdateBusinessWhatsappUseCase(businessRepo),
  // Conversations
  listConversationsUseCase: new ListConversationsUseCase(conversationRepo),
  getConversationMessagesUseCase: new GetConversationMessagesUseCase(conversationRepo),
  // Professionals
  listProfessionalsUseCase: new ListProfessionalsUseCase(professionalRepo),
  createProfessionalUseCase: new CreateProfessionalUseCase(professionalRepo),
  updateProfessionalUseCase: new UpdateProfessionalUseCase(professionalRepo),
  deleteProfessionalUseCase: new DeleteProfessionalUseCase(professionalRepo),
} as const;
