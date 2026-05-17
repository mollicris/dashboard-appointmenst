import type { IConversationRepository } from "@domain/conversation/IConversationRepository";
import type { ConversationDetail } from "@domain/conversation/Conversation";

export class GetConversationMessagesUseCase {
  constructor(private readonly repo: IConversationRepository) {}

  execute(conversationId: string): Promise<ConversationDetail> {
    return this.repo.getMessages(conversationId);
  }
}
