import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getServiceColor } from "../utils/serviceColors";
import type { Appointment } from "@domain/appointment/Appointment";

interface MonthCalendarProps {
  appointments: Appointment[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthCalendar({
  appointments,
  selectedDate,
  onDateSelect,
  currentMonth,
  onMonthChange,
}: MonthCalendarProps) {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);

  // Group appointments by date
  const appointmentsByDate = new Map<string, Appointment[]>();
  appointments.forEach((apt) => {
    const dateKey = format(apt.scheduledAt, "yyyy-MM-dd");
    if (!appointmentsByDate.has(dateKey)) {
      appointmentsByDate.set(dateKey, []);
    }
    appointmentsByDate.get(dateKey)!.push(apt);
  });

  // Calendar grid: show days from previous/next month to fill 7x6
  const firstDayOfWeek = start.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const adjustedStart = new Date(start);
  adjustedStart.setDate(adjustedStart.getDate() - firstDayOfWeek);

  const calendarDays = eachDayOfInterval({
    start: adjustedStart,
    end: new Date(end.getFullYear(), end.getMonth(), end.getDate() + (6 - end.getDay())),
  });

  return (
    <div className="w-full rounded-lg border bg-white p-6 shadow-sm">
      {/* Header with month/year and navigation */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="rounded-md p-2 hover:bg-muted"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => onMonthChange(new Date())}
            className="rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Hoy
          </button>
          <button
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="rounded-md p-2 hover:bg-muted"
            aria-label="Próximo mes"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayAppointments = appointmentsByDate.get(dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={dateKey}
              onClick={() => onDateSelect(day)}
              className={`
                relative h-24 rounded-md border p-2 text-left text-xs transition-all
                ${!isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-white hover:bg-muted/50"}
                ${isSelected ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-muted"}
                ${isToday ? "border-orange-400 bg-orange-50" : ""}
              `}
            >
              <div className="font-semibold">{format(day, "d")}</div>

              {/* Appointment colored squares */}
              {dayAppointments.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {dayAppointments.slice(0, 3).map((apt) => {
                    const color = getServiceColor(apt.serviceId);
                    const opacity = apt.status === "confirmed" ? "100" : "60";
                    return (
                      <div
                        key={apt.id}
                        className={`h-1.5 w-1.5 rounded-sm`}
                        style={{
                          backgroundColor: color.border,
                          opacity: parseInt(opacity) / 100,
                        }}
                        title={`${apt.status === "confirmed" ? "✓" : "○"}`}
                      />
                    );
                  })}
                  {dayAppointments.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{dayAppointments.length - 3}</span>
                  )}
                </div>
              )}

              {/* Occupancy bar */}
              {dayAppointments.length > 0 && (
                <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-amber-500"
                    style={{ width: `${Math.min(dayAppointments.length * 25, 100)}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-6 border-t pt-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>Confirmadas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Pendientes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1 flex-1 bg-muted" />
          <span>Ocupancia del día</span>
        </div>
      </div>
    </div>
  );
}
