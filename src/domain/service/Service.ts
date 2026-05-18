export interface Service {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly description: string | null;
  readonly durationMinutes: number;
  readonly price: number | null;
  readonly isActive: boolean;
  readonly professionalIds: string[];
}

export interface CreateServicePayload {
  name: string;
  durationMinutes: number;
  description?: string | null;
  price?: number | null;
}

export interface UpdateServicePayload {
  name?: string;
  durationMinutes?: number;
  description?: string | null;
  price?: number | null;
}
