export interface Business {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly phone: string;
  readonly email: string | null;
  readonly isActive: boolean;
  readonly whatsappPhoneNumberId: string | null;
  readonly ownerWhatsapp: string | null;
  readonly hasWhatsappAppSecret: boolean;
}

export interface UpdateWhatsappPayload {
  phoneNumberId: string | null;
  appSecret: string | null;
  ownerWhatsapp: string | null;
}
