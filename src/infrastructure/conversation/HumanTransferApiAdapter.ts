import { httpClient } from "@core/api/http-client";
import type { HumanTransfer } from "@domain/conversation/HumanTransfer";

interface TransferDto {
  transfer_id: string;
  conversation_id: string;
  client_id: string;
  reason: string | null;
  status: "pending" | "resolved";
  context_snapshot: Array<{ sender: string; content: string }>;
  created_at: string;
  resolved_at: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: { total: number; page: number; page_size: number; pages: number };
}

function toTransfer(dto: TransferDto): HumanTransfer {
  return {
    transferId: dto.transfer_id,
    conversationId: dto.conversation_id,
    clientId: dto.client_id,
    reason: dto.reason,
    status: dto.status,
    contextSnapshot: dto.context_snapshot,
    createdAt: new Date(dto.created_at),
    resolvedAt: dto.resolved_at ? new Date(dto.resolved_at) : null,
  };
}

export const humanTransferApi = {
  listByBusiness: async (businessId: string, status?: string): Promise<HumanTransfer[]> => {
    const params: Record<string, string> = {};
    if (status) params["status"] = status;
    const res = await httpClient.get<PaginatedResponse<TransferDto>>(
      `/api/v1/businesses/${businessId}/transfers`,
      params,
    );
    return res.data.map(toTransfer);
  },

  resolve: async (transferId: string): Promise<void> => {
    await httpClient.put(`/api/v1/transfers/${transferId}/resolve`, {});
  },
};
