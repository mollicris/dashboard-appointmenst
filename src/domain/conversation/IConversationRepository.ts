import type { ConversationDetail, ConversationSummary } from "./Conversation";

export interface IConversationRepository {
  listByBusiness(businessId: string, page?: number, pageSize?: number): Promise<ConversationSummary[]>;
  getMessages(conversationId: string): Promise<ConversationDetail>;
}
