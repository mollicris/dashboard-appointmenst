import { AuthApiAdapter } from "@infrastructure/auth/AuthApiAdapter";
import { AppointmentApiAdapter } from "@infrastructure/appointment/AppointmentApiAdapter";
import { ServiceApiAdapter } from "@infrastructure/service/ServiceApiAdapter";
import { BusinessApiAdapter } from "@infrastructure/business/BusinessApiAdapter";
import { ConversationApiAdapter } from "@infrastructure/conversation/ConversationApiAdapter";

import { LoginUseCase } from "@application/auth/LoginUseCase";
import { LogoutUseCase } from "@application/auth/LogoutUseCase";
import { GetCurrentUserUseCase } from "@application/auth/GetCurrentUserUseCase";
import { ListAppointmentsUseCase } from "@application/appointment/ListAppointmentsUseCase";
import { CancelAppointmentUseCase } from "@application/appointment/CancelAppointmentUseCase";
import { ListServicesUseCase } from "@application/service/ListServicesUseCase";
import { ListBusinessesUseCase } from "@application/business/ListBusinessesUseCase";
import { ListConversationsUseCase } from "@application/conversation/ListConversationsUseCase";
import { GetConversationMessagesUseCase } from "@application/conversation/GetConversationMessagesUseCase";

// ── Infrastructure (adapters — implement domain ports) ────────────────────────
const authRepo = new AuthApiAdapter();
const appointmentRepo = new AppointmentApiAdapter();
const serviceRepo = new ServiceApiAdapter();
const businessRepo = new BusinessApiAdapter();
const conversationRepo = new ConversationApiAdapter();

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
  // Businesses
  listBusinessesUseCase: new ListBusinessesUseCase(businessRepo),
  // Conversations
  listConversationsUseCase: new ListConversationsUseCase(conversationRepo),
  getConversationMessagesUseCase: new GetConversationMessagesUseCase(conversationRepo),
} as const;
