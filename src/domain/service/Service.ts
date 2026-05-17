export interface Service {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly durationMinutes: number;
  readonly price: number | null;
  readonly isActive: boolean;
}
