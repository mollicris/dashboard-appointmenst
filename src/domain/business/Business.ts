export interface Business {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly phone: string;
  readonly email: string | null;
  readonly isActive: boolean;
}
