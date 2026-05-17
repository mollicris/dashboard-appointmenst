import type { IConversationRepository } from "@domain/conversation/IConversationRepository";
import type { ConversationSummary } from "@domain/conversation/Conversation";

export class ListConversationsUseCase {
  constructor(private readonly repo: IConversationRepository) {}

  execute(businessId: string, page = 1, pageSize = 20): Promise<ConversationSummary[]> {
    return this.repo.listByBusiness(businessId, page, pageSize);
  }
}
