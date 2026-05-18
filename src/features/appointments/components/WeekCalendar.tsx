import { useState } from "react";
import { format, startOfWeek, addDays, startOfDay, endOfDay, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getServiceColor } from "../utils/serviceColors";
import type { Appointment } from "@domain/appointment/Appointment";

interface WeekCalendarProps {
  readonly appointments: Appointment[];
  readonly currentWeekStart: Date;
  readonly onWeekChange: (date: Date) => void;
  readonly onAppointmentClick: (apt: Appointment) => void;
  readonly onAppointmentDrop: (appointmentId: string, newTime: Date) => void;
  readonly statusFilter: string[];
}

export function WeekCalendar({
  appointments,
  currentWeekStart,
  onWeekChange,
  onAppointmentClick,
  onAppointmentDrop,
  statusFilter,
}: WeekCalendarProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter appointments by week and status
  const weekStart = startOfDay(currentWeekStart);
  const weekEnd = endOfDay(addDays(currentWeekStart, 6));
  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.scheduledAt >= weekStart &&
      apt.scheduledAt <= weekEnd &&
      statusFilter.includes(apt.status)
  );

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return filteredAppointments.filter((apt) => {
      const aptStart = apt.scheduledAt;
      const aptHour = aptStart.getHours();
      return (
        format(aptStart, "yyyy-MM-dd") === format(day, "yyyy-MM-dd") &&
        aptHour === hour
      );
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, apt: Appointment) => {
    setDraggedAppointment(apt);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: Date, hour: number) => {
    e.preventDefault();
    if (!draggedAppointment) return;

    // Create new time by combining the day and hour
    const newTime = setHours(setMinutes(day, draggedAppointment.scheduledAt.getMinutes()), hour);

    // Validate that new time is in the future
    if (newTime <= new Date()) {
      return; // Validation will be handled by the backend with proper error message
    }

    onAppointmentDrop(draggedAppointment.id, newTime);
    setDraggedAppointment(null);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
  };

  return (
    <div className="w-full rounded-lg border bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          Semana del {format(currentWeekStart, "d 'de' MMMM", { locale: es })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => onWeekChange(addDays(currentWeekStart, -7))}
            className="rounded-md p-2 hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => onWeekChange(startOfWeek(new Date()))}
            className="rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Hoy
          </button>
          <button
            onClick={() => onWeekChange(addDays(currentWeekStart, 7))}
            className="rounded-md p-2 hover:bg-muted"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          {/* Hour labels column header */}
          <div className="sticky left-0 z-10 bg-white"></div>

          {/* Day headers */}
          {weekDays.map((day) => (
            <div
              key={format(day, "yyyy-MM-dd")}
              className="border-b p-2 text-center text-sm font-semibold"
            >
              <div>{format(day, "EEE", { locale: es })}</div>
              <div className="text-lg">{format(day, "d")}</div>
            </div>
          ))}

          {/* Hour rows */}
          {hours.map((hour) => (
            <div key={`row-${hour}`} className="contents">
              {/* Hour label */}
              <div className="sticky left-0 z-10 border-r bg-muted/30 p-2 text-right text-xs font-medium text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </div>

              {/* Time slots */}
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForSlot(day, hour);
                const isDropZone = draggedAppointment !== null;
                const dateStr = format(day, "yyyy-MM-dd");
                const draggedDateStr = draggedAppointment ? format(draggedAppointment.scheduledAt, "yyyy-MM-dd") : null;
                const draggedHour = draggedAppointment?.scheduledAt.getHours();
                const isTargetSlot = isDropZone && draggedDateStr === dateStr && draggedHour === hour;

                let slotBgClass = "bg-white hover:bg-muted/10";
                if (isTargetSlot) {
                  slotBgClass = "bg-primary/10";
                } else if (isDropZone) {
                  slotBgClass = "bg-muted/5 hover:bg-muted/20";
                }

                return (
                  <div
                    key={`${dateStr}-${hour}`}
                    role="none"
                    onDragOver={isDropZone ? handleDragOver : undefined}
                    onDrop={isDropZone ? (e) => handleDrop(e, day, hour) : undefined}
                    className={`relative min-h-20 border-b border-r p-1 transition-colors ${slotBgClass}`}
                  >
                    {dayAppointments.map((apt) => {
                      const color = getServiceColor(apt.serviceId);
                      const opacity = apt.status === "confirmed" ? "100" : "60";
                      const isDragging = draggedAppointment?.id === apt.id;
                      return (
                        <button
                          key={apt.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, apt)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onAppointmentClick(apt)}
                          className={`w-full rounded border-l-4 p-1 text-left text-xs font-medium transition-all hover:shadow-md ${
                            isDragging ? "opacity-50 ring-2 ring-primary" : ""
                          }`}
                          style={{
                            backgroundColor: color.bg,
                            borderLeftColor: color.border,
                            color: color.text,
                            opacity: isDragging ? 0.5 : Number.parseInt(opacity) / 100,
                            cursor: isDragging ? "grabbing" : "grab",
                          }}
                          title={`${format(apt.scheduledAt, "HH:mm")} - ${apt.durationMinutes}min`}
                        >
                          <div className="truncate font-semibold">
                            {format(apt.scheduledAt, "HH:mm")}
                          </div>
                          <div className="truncate text-xs opacity-80">
                            {apt.id.substring(0, 8)}...
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
        <div>💡 Haz click en una cita para editarla. Usa drag & drop para reschedule.</div>
      </div>
    </div>
  );
}
