import { MessageCircle } from "lucide-react";
import { EmptyState } from "@shared/components/ui/EmptyState";

export function ConversationsList() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Conversaciones</h1>
      <EmptyState
        title="Próximamente"
        description="El historial de conversaciones de WhatsApp estará disponible aquí."
        icon={<MessageCircle className="h-10 w-10" />}
      />
    </div>
  );
}
