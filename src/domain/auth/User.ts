export type UserRole = "admin" | "staff" | "viewer";

export type TenantStatus =
  | "pending_verification"
  | "onboarding"
  | "active"
  | "trial_expired"
  | "suspended"
  | "cancelled"
  | "unknown";

export interface User {
  readonly id: string;
  readonly tenantId: string;
  readonly email: string;
  readonly role: UserRole;
  readonly tenantStatus: TenantStatus;
}
