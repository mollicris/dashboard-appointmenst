export interface ConversationSummary {
  readonly conversationId: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly clientWhatsapp: string;
  readonly currentState: string;
  readonly messageCount: number;
  readonly isEscalated: boolean;
  readonly lastMessageAt: Date;
}

export interface Message {
  readonly messageId: string;
  readonly sender: "client" | "bot";
  readonly messageType: string;
  readonly content: string;
  readonly createdAt: Date;
}

export interface ConversationDetail extends ConversationSummary {
  readonly messages: Message[];
}
