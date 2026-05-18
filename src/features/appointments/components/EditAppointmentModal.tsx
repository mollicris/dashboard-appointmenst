import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatInTimeZone } from "date-fns-tz";
import { X, Clock } from "lucide-react";
import { toast } from "sonner";
import { container } from "@infrastructure/di/container";
import { getServiceColor } from "../utils/serviceColors";
import type { Appointment } from "@domain/appointment/Appointment";

interface EditAppointmentModalProps {
  readonly appointment: Appointment | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}

export function EditAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onSaved,
}: EditAppointmentModalProps) {
  const qc = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: (id: string) => container.cancelAppointmentUseCase.execute(id),
    onSuccess: () => {
      toast.success("Cita cancelada");
      qc.invalidateQueries({ queryKey: ["appointments"] }).catch(() => {});
      onSaved();
      onClose();
    },
    onError: () => toast.error("No se pudo cancelar la cita"),
  });

  if (!isOpen || !appointment) return null;

  const color = getServiceColor(appointment.serviceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-bold">Editar Cita</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Date & Time */}
          <div>
            <div className="text-sm font-medium">Fecha y hora</div>
            <div className="mt-2 flex items-center gap-3 rounded-lg bg-muted/30 p-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {formatInTimeZone(appointment.scheduledAt, "UTC", "dd MMM yyyy HH:mm")}
                </div>
                <div className="text-xs text-muted-foreground">
                  Duración: {appointment.durationMinutes} min
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              💡 Usa drag & drop en el calendario para cambiar la hora
            </p>
          </div>

          {/* Service */}
          <div>
            <div className="text-sm font-medium">Servicio</div>
            <div
              className="mt-2 rounded-lg p-3"
              style={{
                backgroundColor: color.bg,
                borderLeft: `4px solid ${color.border}`,
              }}
            >
              <div style={{ color: color.text }} className="font-medium">
                {appointment.serviceName}
              </div>
              {appointment.professionalName && (
                <div style={{ color: color.text }} className="mt-0.5 text-xs opacity-80">
                  con {appointment.professionalName}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="text-sm font-medium">Estado</div>
            <div className="mt-2 rounded-md bg-muted/30 px-3 py-2 text-sm">
              {appointment.status === "pending" && "⏳ Pendiente"}
              {appointment.status === "confirmed" && "✅ Confirmada"}
              {appointment.status === "rescheduled" && "🔄 Reagendada"}
              {appointment.status === "cancelled" && "❌ Cancelada"}
              {appointment.status === "completed" && "✓ Completada"}
              {appointment.status === "no_show" && "✗ No asistió"}
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div>
              <div className="text-sm font-medium">Notas</div>
              <div className="mt-2 rounded-md bg-muted/30 px-3 py-2 text-sm">
                {appointment.notes}
              </div>
            </div>
          )}

          {/* Client Info */}
          <div className="rounded-lg bg-muted/30 p-4">
            <div className="text-sm font-medium">Información del cliente</div>
            <div className="mt-2 text-xs text-muted-foreground">
              <div>Nombre: {appointment.clientName}</div>
              <div>Creada: {formatInTimeZone(appointment.createdAt, "UTC", "dd MMM yyyy HH:mm")}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t p-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              if (appointment.status !== "cancelled") {
                cancelMutation.mutate(appointment.id);
              }
            }}
            disabled={cancelMutation.isPending || appointment.status === "cancelled"}
            className="flex-1 rounded-md border border-red-300/50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {cancelMutation.isPending ? "Cancelando..." : "Cancelar Cita"}
          </button>
        </div>
      </div>
    </div>
  );
}
