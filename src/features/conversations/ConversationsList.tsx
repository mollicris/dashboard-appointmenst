import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MessageCircle, ArrowLeft, RefreshCw, AlertTriangle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@shared/components/ui/Badge";
import { PageLoader } from "@shared/components/ui/LoadingSpinner";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { container } from "@infrastructure/di/container";
import { humanTransferApi } from "@infrastructure/conversation/HumanTransferApiAdapter";
import type { ConversationSummary, ConversationDetail, Message } from "@domain/conversation/Conversation";
import type { HumanTransfer } from "@domain/conversation/HumanTransfer";
import { useCurrentBusiness } from "../appointments/hooks/useCurrentBusiness";

const STATE_LABELS: Record<string, string> = {
  idle: "Inactivo",
  extracting_entities: "Procesando",
  selecting_service: "Eligiendo servicio",
  selecting_date: "Eligiendo fecha",
  selecting_time: "Eligiendo hora",
  selecting_professional: "Eligiendo profesional",
  collecting_name: "Recopilando datos",
  collecting_dynamic_fields: "Recopilando datos",
  confirming_appointment: "Confirmando",
  appointment_booked: "Agendado",
  appointment_cancelled: "Cancelado",
  confirming_cancel: "Cancelando",
  confirming_reschedule: "Reagendando",
  human_handover: "Atención humana",
  waiting_for_more: "En espera",
};

const STATE_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  appointment_booked: "success",
  human_handover: "danger",
  appointment_cancelled: "muted",
  waiting_for_more: "warning",
};

export function ConversationsList() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { businessId, isLoading: bizLoading } = useCurrentBusiness();

  const listQuery = useQuery({
    queryKey: ["conversations", businessId],
    queryFn: () => container.listConversationsUseCase.execute(businessId!),
    enabled: !!businessId,
    refetchInterval: 30_000,
  });

  const detailQuery = useQuery({
    queryKey: ["conversation-messages", selectedId],
    queryFn: () => container.getConversationMessagesUseCase.execute(selectedId!),
    enabled: !!selectedId,
    refetchInterval: 10_000,
  });

  const transferQuery = useQuery({
    queryKey: ["transfers", businessId, "pending"],
    queryFn: () => humanTransferApi.listByBusiness(businessId!, "pending"),
    enabled: !!businessId && !!selectedId,
  });

  const qc = useQueryClient();
  const resolveMutation = useMutation({
    mutationFn: (transferId: string) => humanTransferApi.resolve(transferId),
    onSuccess: () => {
      toast.success("Conversación devuelta al bot");
      qc.invalidateQueries({ queryKey: ["conversation-messages", selectedId] }).catch(() => {});
      qc.invalidateQueries({ queryKey: ["conversations", businessId] }).catch(() => {});
      qc.invalidateQueries({ queryKey: ["transfers"] }).catch(() => {});
    },
    onError: () => toast.error("No se pudo resolver el escalamiento"),
  });

  if (bizLoading || listQuery.isLoading) return <PageLoader />;

  if (selectedId) {
    const activeTransfer = transferQuery.data?.find(
      (t) => t.conversationId === selectedId && t.status === "pending",
    ) ?? null;

    return (
      <ConversationDetail
        detail={detailQuery.data ?? null}
        isLoading={detailQuery.isLoading}
        activeTransfer={activeTransfer}
        onBack={() => setSelectedId(null)}
        onRefresh={() => detailQuery.refetch()}
        onResolve={(id) => resolveMutation.mutate(id)}
        isResolving={resolveMutation.isPending}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Conversaciones</h1>
        <button
          onClick={() => listQuery.refetch()}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualizar
        </button>
      </div>

      {listQuery.isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Error al cargar las conversaciones.
        </div>
      )}

      {listQuery.data?.length === 0 && (
        <EmptyState
          title="Sin conversaciones"
          description="Las conversaciones de WhatsApp aparecerán aquí."
          icon={<MessageCircle className="h-10 w-10" />}
        />
      )}

      {listQuery.data && listQuery.data.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          {listQuery.data.map((conv) => (
            <ConversationRow
              key={conv.conversationId}
              conv={conv}
              onClick={() => setSelectedId(conv.conversationId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConversationRow({
  conv,
  onClick,
}: Readonly<{ conv: ConversationSummary; onClick: () => void }>) {
  const stateLabel = STATE_LABELS[conv.currentState] ?? conv.currentState;
  const variant = conv.isEscalated
    ? "danger"
    : (STATE_VARIANT[conv.currentState] ?? "default");

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted/40 transition-colors"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageCircle className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{conv.clientName}</span>
          {conv.isEscalated && (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">{conv.clientWhatsapp}</div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <Badge label={stateLabel} variant={variant} />
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(conv.lastMessageAt, { locale: es, addSuffix: true })}
        </span>
      </div>

      <div className="text-xs text-muted-foreground shrink-0">
        {conv.messageCount} msgs
      </div>
    </button>
  );
}

function ConversationDetail({
  detail,
  isLoading,
  activeTransfer,
  onBack,
  onRefresh,
  onResolve,
  isResolving,
}: Readonly<{
  detail: ConversationDetail | null;
  isLoading: boolean;
  activeTransfer: HumanTransfer | null;
  onBack: () => void;
  onRefresh: () => void;
  onResolve: (transferId: string) => void;
  isResolving: boolean;
}>) {
  if (isLoading || !detail) return <PageLoader />;

  const stateLabel = STATE_LABELS[detail.currentState] ?? detail.currentState;
  const variant = detail.isEscalated ? "danger" : (STATE_VARIANT[detail.currentState] ?? "default");

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Escalation banner */}
      {activeTransfer && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="font-medium text-destructive">Escalado al staff</span>
            {activeTransfer.reason && (
              <span className="text-muted-foreground">— {activeTransfer.reason}</span>
            )}
          </div>
          <button
            onClick={() => onResolve(activeTransfer.transferId)}
            disabled={isResolving}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <UserCheck className="h-3.5 w-3.5" />
            {isResolving ? "Resolviendo…" : "Resolver y reactivar bot"}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{detail.clientName}</span>
            {detail.isEscalated && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <Badge label={stateLabel} variant={variant} />
          </div>
          <div className="text-sm text-muted-foreground">{detail.clientWhatsapp}</div>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-lg border bg-muted/20 p-4">
        {detail.messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Sin mensajes</p>
        ) : (
          <div className="space-y-3">
            {detail.messages.map((msg) => (
              <ChatBubble key={msg.messageId} msg={msg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatBubble({ msg }: Readonly<{ msg: Message }>) {
  const isBot = msg.sender === "bot";
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isBot
            ? "rounded-tl-sm bg-background shadow-sm"
            : "rounded-tr-sm bg-primary text-primary-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        <p
          className={`mt-1 text-right text-[10px] ${
            isBot ? "text-muted-foreground" : "text-primary-foreground/70"
          }`}
        >
          {format(msg.createdAt, "HH:mm")}
        </p>
      </div>
    </div>
  );
}
