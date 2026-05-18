import type { Business, UpdateWhatsappPayload } from "./Business";

export interface IBusinessRepository {
  list(): Promise<Business[]>;
  getById(id: string): Promise<Business | null>;
  updateWhatsapp(id: string, payload: UpdateWhatsappPayload): Promise<Business>;
}
