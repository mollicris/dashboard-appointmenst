export interface HumanTransfer {
  readonly transferId: string;
  readonly conversationId: string;
  readonly clientId: string;
  readonly reason: string | null;
  readonly status: "pending" | "resolved";
  readonly contextSnapshot: Array<{ sender: string; content: string }>;
  readonly createdAt: Date;
  readonly resolvedAt: Date | null;
}
