import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfWeek } from "date-fns";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { container } from "@infrastructure/di/container";
import { PageLoader } from "@shared/components/ui/LoadingSpinner";
import { MonthCalendar } from "./components/MonthCalendar";
import { WeekCalendar } from "./components/WeekCalendar";
import { DayDetailsPanel } from "./components/DayDetailsPanel";
import { FilterPanel } from "./components/FilterPanel";
import { EditAppointmentModal } from "./components/EditAppointmentModal";
import { CreateAppointmentModal } from "./components/CreateAppointmentModal";
import { useCurrentBusiness } from "./hooks/useCurrentBusiness";
import { appointmentsApi } from "@infrastructure/api/appointments";
import type { Appointment } from "@domain/appointment/Appointment";

type ViewMode = "month" | "week" | "day";

export function CalendarView() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [statusFilter, setStatusFilter] = useState(["pending", "confirmed", "rescheduled"]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { businessId, isLoading: bizLoading } = useCurrentBusiness();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["appointments", businessId],
    queryFn: () =>
      container.listAppointmentsUseCase.execute({
        businessId: businessId!,
        page: 1,
        pageSize: 100,
      }),
    enabled: !!businessId,
  });

  const rescheduleMutation = useMutation({
    mutationFn: (data: { appointmentId: string; newTime: Date }) =>
      appointmentsApi.reschedule(data.appointmentId, data.newTime),
    onSuccess: () => {
      toast.success("Cita reagendada correctamente");
      qc.invalidateQueries({ queryKey: ["appointments"] }).catch(() => {});
    },
    onError: (error: any) => {
      let message = "No se pudo reagendar la cita";

      // Check for specific error messages from backend
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error?.response?.data?.errors?.[0]?.message) {
        message = error.response.data.errors[0].message;
      }

      // Translate specific backend messages to Spanish
      if (message.includes("in the future")) {
        message = "El horario debe ser posterior a la fecha y hora actual";
      } else if (message.includes("already taken") || message.includes("no longer available")) {
        message = "El horario ya está ocupado, intenta otro";
      }

      toast.error(message);
    },
  });

  if (bizLoading || isLoading) return <PageLoader />;

  const appointments = data?.items || [];
  const filteredAppointments = appointments.filter((apt) =>
    statusFilter.includes(apt.status)
  );

  // Filter appointments for the selected day
  const selectedDayAppointments = selectedDate
    ? filteredAppointments.filter(
        (apt) =>
          apt.scheduledAt.toDateString() === selectedDate.toDateString()
      )
    : [];

  const handleAppointmentDrop = (appointmentId: string, newTime: Date) => {
    rescheduleMutation.mutate({ appointmentId, newTime });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario de Citas</h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona todas tus citas con vista por mes, semana o día
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nueva Cita
        </button>
      </div>

      {/* Filters */}
      <FilterPanel
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Calendar Views */}
      {viewMode === "month" && (
        <div className="flex gap-4 rounded-lg border bg-white shadow-sm">
          <div className="flex-1">
            <MonthCalendar
              appointments={filteredAppointments}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </div>
          <DayDetailsPanel
            date={selectedDate}
            appointments={selectedDayAppointments}
            onClose={() => setSelectedDate(null)}
            onEditAppointment={setEditingAppointment}
          />
        </div>
      )}

      {viewMode === "week" && (
        <WeekCalendar
          appointments={filteredAppointments}
          currentWeekStart={currentWeekStart}
          onWeekChange={setCurrentWeekStart}
          onAppointmentClick={setEditingAppointment}
          onAppointmentDrop={handleAppointmentDrop}
          statusFilter={statusFilter}
        />
      )}

      {viewMode === "day" && (
        <div className="rounded-lg border bg-white p-6 shadow-sm text-center text-muted-foreground">
          📅 Vista de día próximamente...
        </div>
      )}

      {/* Edit Modal */}
      <EditAppointmentModal
        appointment={editingAppointment}
        isOpen={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
        onSaved={() => {
          setEditingAppointment(null);
          setSelectedDate(null);
        }}
      />

      {/* Create Modal */}
      {businessId && (
        <CreateAppointmentModal
          isOpen={isCreateModalOpen}
          businessId={businessId}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
}
