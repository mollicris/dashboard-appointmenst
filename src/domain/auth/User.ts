export type UserRole = "admin" | "staff" | "viewer";

export interface User {
  readonly id: string;
  readonly tenantId: string;
  readonly email: string;
  readonly role: UserRole;
}
