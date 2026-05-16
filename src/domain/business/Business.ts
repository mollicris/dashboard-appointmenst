export interface Business {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly industry: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly isActive: boolean;
}
