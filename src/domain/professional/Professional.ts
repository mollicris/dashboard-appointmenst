export interface Professional {
  readonly id: string;
  readonly businessId: string;
  readonly userId: string | null;
  readonly name: string;
  readonly phone: string | null;
  readonly isActive: boolean;
}

export interface CreateProfessionalPayload {
  name: string;
  phone?: string | null;
}

export interface UpdateProfessionalPayload {
  name?: string;
  phone?: string | null;
}
