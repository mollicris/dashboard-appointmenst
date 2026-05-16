import type { Business } from "./Business";

export interface IBusinessRepository {
  list(): Promise<Business[]>;
  getById(id: string): Promise<Business | null>;
}
