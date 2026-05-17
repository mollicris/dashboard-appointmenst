import type { IConversationRepository } from "@domain/conversation/IConversationRepository";
import type { ConversationDetail, ConversationSummary, Message } from "@domain/conversation/Conversation";
import { httpClient } from "@core/api/http-client";

interface PaginatedResponse<T> {
  data: T[];
  pagination: { total: number; page: number; page_size: number; pages: number };
}

interface ApiResponse<T> {
  data: T;
}

interface ConversationSummaryDto {
  conversation_id: string;
  client_id: string;
  client_name: string;
  client_whatsapp: string;
  current_state: string;
  message_count: number;
  is_escalated: boolean;
  last_message_at: string;
}

interface MessageDto {
  message_id: string;
  sender: string;
  message_type: string;
  content: string;
  created_at: string;
}

interface ConversationDetailDto extends ConversationSummaryDto {
  messages: MessageDto[];
}

function toSummary(dto: ConversationSummaryDto): ConversationSummary {
  return {
    conversationId: dto.conversation_id,
    clientId: dto.client_id,
    clientName: dto.client_name,
    clientWhatsapp: dto.client_whatsapp,
    currentState: dto.current_state,
    messageCount: dto.message_count,
    isEscalated: dto.is_escalated,
    lastMessageAt: new Date(dto.last_message_at),
  };
}

function toMessage(dto: MessageDto): Message {
  return {
    messageId: dto.message_id,
    sender: dto.sender as "client" | "bot",
    messageType: dto.message_type,
    content: dto.content,
    createdAt: new Date(dto.created_at),
  };
}

export class ConversationApiAdapter implements IConversationRepository {
  async listByBusiness(businessId: string, page = 1, pageSize = 20): Promise<ConversationSummary[]> {
    const res = await httpClient.get<PaginatedResponse<ConversationSummaryDto>>(
      `/api/v1/businesses/${businessId}/conversations`,
      { page, page_size: pageSize },
    );
    return res.data.map(toSummary);
  }

  async getMessages(conversationId: string): Promise<ConversationDetail> {
    const res = await httpClient.get<ApiResponse<ConversationDetailDto>>(
      `/api/v1/conversations/${conversationId}/messages`,
    );
    const dto = res.data;
    return {
      ...toSummary(dto),
      messages: dto.messages.map(toMessage),
    };
  }
}
