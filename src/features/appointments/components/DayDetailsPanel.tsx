import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { X, Clock, User, AlertCircle } from "lucide-react";
import { StatusBadge } from "@shared/components/ui/Badge";
import type { Appointment } from "@domain/appointment/Appointment";

interface DayDetailsPanelProps {
  date: Date | null;
  appointments: Appointment[];
  onClose: () => void;
  onEditAppointment: (apt: Appointment) => void;
}

export function DayDetailsPanel({
  date,
  appointments,
  onClose,
  onEditAppointment,
}: DayDetailsPanelProps) {
  if (!date) {
    return (
      <div className="w-80 border-l bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Selecciona un día para ver las citas
      </div>
    );
  }

  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <div className="w-80 border-l bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold">
            {format(date, "dd 'de' MMMM", { locale: es })}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(date, "EEEE", { locale: es })}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-muted"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-4 text-sm">
        <div>
          <div className="font-semibold text-green-700">{confirmedCount}</div>
          <div className="text-xs text-muted-foreground">Confirmadas</div>
        </div>
        <div>
          <div className="font-semibold text-amber-700">{pendingCount}</div>
          <div className="text-xs text-muted-foreground">Pendientes</div>
        </div>
      </div>

      {/* Appointments list */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-lg bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            Sin citas este día
          </div>
        ) : (
          appointments
            .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
            .map((apt) => (
              <div
                key={apt.id}
                className="rounded-lg border p-4 hover:shadow-md transition-all"
              >
                {/* Time + Status */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {formatInTimeZone(apt.scheduledAt, "UTC", "HH:mm")} – {formatInTimeZone(apt.endsAt, "UTC", "HH:mm")}
                    </span>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>

                {/* Client info */}
                <div className="space-y-2 border-t pt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{apt.clientName}</span>
                  </div>

                  {/* Service + Duration */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{apt.durationMinutes} min</span>
                  </div>

                  {/* Price if available */}
                  {apt.notes && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">{apt.notes}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => onEditAppointment(apt)}
                    className="flex-1 rounded-md border border-primary/30 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/5"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onEditAppointment(apt)}
                    className="flex-1 rounded-md border border-red-300/50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
