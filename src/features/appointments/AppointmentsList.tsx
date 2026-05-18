import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarDays, X } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@shared/components/ui/Badge";
import { PageLoader } from "@shared/components/ui/LoadingSpinner";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { container } from "@infrastructure/di/container";
import { isActive } from "@domain/appointment/Appointment";
import type { Appointment } from "@domain/appointment/Appointment";
import { useCurrentBusiness } from "./hooks/useCurrentBusiness";

const PAGE_SIZE = 20;

export function AppointmentsList() {
  const [page, setPage] = useState(1);
  const [onDate, setOnDate] = useState("");
  const qc = useQueryClient();
  const { businessId, isLoading: bizLoading } = useCurrentBusiness();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["appointments", businessId, onDate, page],
    queryFn: () =>
      container.listAppointmentsUseCase.execute({
        businessId: businessId!,
        onDate: onDate || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    enabled: !!businessId,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => container.cancelAppointmentUseCase.execute(id),
    onSuccess: () => {
      toast.success("Cita cancelada");
      qc.invalidateQueries({ queryKey: ["appointments"] }).catch(() => {});
    },
    onError: () => toast.error("No se pudo cancelar la cita"),
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  if (bizLoading || isLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Citas</h1>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={onDate}
            onChange={(e) => { setOnDate(e.target.value); setPage(1); }}
            className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {onDate && (
            <button
              onClick={() => setOnDate("")}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Error al cargar las citas.
        </div>
      )}

      {data?.items.length === 0 && (
        <EmptyState
          title="Sin citas"
          description={onDate ? "No hay citas para la fecha seleccionada." : "No hay citas registradas aún."}
          icon={<CalendarDays className="h-10 w-10" />}
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Fecha y hora</th>
                  <th className="px-4 py-3 text-left font-medium">Duración</th>
                  <th className="px-4 py-3 text-left font-medium">Profesional</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Notas</th>
                  <th className="px-4 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((apt) => (
                  <AppointmentRow
                    key={apt.id}
                    apt={apt}
                    onCancel={(id) => cancelMutation.mutate(id)}
                    isCancelling={cancelMutation.isPending && cancelMutation.variables === apt.id}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>{data.total} citas en total</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border px-3 py-1 disabled:opacity-50 hover:bg-muted"
                >
                  Anterior
                </button>
                <span className="flex items-center px-2">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border px-3 py-1 disabled:opacity-50 hover:bg-muted"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AppointmentRow({
  apt,
  onCancel,
  isCancelling,
}: Readonly<{
  apt: Appointment;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}>) {
  return (
    <tr className="hover:bg-muted/20">
      <td className="px-4 py-3">
        <div className="font-medium">
          {formatInTimeZone(apt.scheduledAt, "UTC", "dd MMM yyyy", { locale: es })}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatInTimeZone(apt.scheduledAt, "UTC", "HH:mm")} – {formatInTimeZone(apt.endsAt, "UTC", "HH:mm")}
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{apt.durationMinutes} min</td>
      <td className="px-4 py-3 text-muted-foreground">
        {apt.professionalName ?? "—"}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={apt.status} />
      </td>
      <td className="px-4 py-3 text-muted-foreground">{apt.notes ?? "—"}</td>
      <td className="px-4 py-3">
        {isActive(apt) && (
          <button
            disabled={isCancelling}
            onClick={() => onCancel(apt.id)}
            className="rounded-md border border-destructive/50 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            {isCancelling ? "Cancelando…" : "Cancelar"}
          </button>
        )}
      </td>
    </tr>
  );
}
