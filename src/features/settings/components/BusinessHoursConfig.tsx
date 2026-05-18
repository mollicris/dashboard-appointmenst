import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, X, Plus } from "lucide-react";
import { businessHoursApi, type SetScheduleRequest } from "@infrastructure/api/business-hours";

interface BusinessHoursConfigProps {
  readonly businessId: string;
}

interface TimeRange {
  open_at: string;
  close_at: string;
}

interface DayConfig {
  day_of_week: number;
  day_name: string;
  is_closed: boolean;
  ranges: TimeRange[];
}

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function BusinessHoursConfig({ businessId }: BusinessHoursConfigProps) {
  const qc = useQueryClient();
  const [schedule, setSchedule] = useState<DayConfig[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["business-hours", businessId],
    queryFn: () => businessHoursApi.getHours(businessId),
  });

  useEffect(() => {
    if (data?.schedule) {
      // Agrupar horarios por día
      const dayMap = new Map<number, DayConfig>();

      data.schedule.forEach((day) => {
        if (!dayMap.has(day.day_of_week)) {
          dayMap.set(day.day_of_week, {
            day_of_week: day.day_of_week,
            day_name: day.day_name,
            is_closed: day.is_closed,
            ranges: [],
          });
        }

        const config = dayMap.get(day.day_of_week);
        if (config && !day.is_closed) {
          config.ranges.push({
            open_at: day.open_at,
            close_at: day.close_at,
          });
        }
      });

      // Asegurar que todos los días existan
      for (let i = 0; i < 7; i++) {
        if (!dayMap.has(i)) {
          dayMap.set(i, {
            day_of_week: i,
            day_name: DAY_NAMES[i] ?? "",
            is_closed: false,
            ranges: [{ open_at: "09:00", close_at: "18:00" }],
          });
        }
      }

      setSchedule(Array.from(dayMap.values()).sort((a, b) => a.day_of_week - b.day_of_week));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (updatedSchedule: DayConfig[]) => {
      const request: SetScheduleRequest = {
        schedule: updatedSchedule.flatMap((day) => {
          if (day.is_closed) {
            return [{
              day_of_week: day.day_of_week,
              open_at: "09:00",
              close_at: "09:00",
              is_closed: true as boolean,
            }];
          }
          return day.ranges.map((range) => ({
            day_of_week: day.day_of_week,
            open_at: range.open_at,
            close_at: range.close_at,
            is_closed: false,
          }));
        }),
      };
      return businessHoursApi.setHours(businessId, request);
    },
    onSuccess: () => {
      toast.success("Horarios guardados correctamente");
      qc.invalidateQueries({ queryKey: ["business-hours", businessId] }).catch(() => {});
    },
    onError: () => {
      toast.error("No se pudieron guardar los horarios");
    },
  });

  const handleTimeChange = (dayIndex: number, rangeIndex: number, field: "open_at" | "close_at", value: string) => {
    const updated = [...schedule];
    const day = updated[dayIndex];
    if (day && day.ranges[rangeIndex]) {
      day.ranges[rangeIndex] = {
        ...day.ranges[rangeIndex],
        [field]: value,
      };
      setSchedule(updated);
    }
  };

  const handleAddRange = (dayIndex: number) => {
    const updated = [...schedule];
    const day = updated[dayIndex];
    if (day) {
      day.ranges.push({ open_at: "12:00", close_at: "14:00" });
      setSchedule(updated);
    }
  };

  const handleRemoveRange = (dayIndex: number, rangeIndex: number) => {
    const updated = [...schedule];
    const day = updated[dayIndex];
    if (day && day.ranges.length > 1) {
      day.ranges.splice(rangeIndex, 1);
      setSchedule(updated);
    }
  };

  const handleClosedChange = (dayIndex: number, isClosed: boolean) => {
    const updated = [...schedule];
    const day = updated[dayIndex];
    if (day) {
      day.is_closed = isClosed;
      if (!isClosed && day.ranges.length === 0) {
        day.ranges = [{ open_at: "09:00", close_at: "18:00" }];
      }
      setSchedule(updated);
    }
  };

  const handleSave = () => {
    // Validar horarios
    const hasErrors = schedule.some((day) => {
      if (day.is_closed) return false;
      return day.ranges.some((range) => range.close_at <= range.open_at);
    });

    if (hasErrors) {
      toast.error("La hora de cierre debe ser posterior a la de apertura");
      return;
    }

    saveMutation.mutate(schedule);
  };

  const handleReset = () => {
    if (data?.schedule) {
      // Recargar desde los datos originales
      const dayMap = new Map<number, DayConfig>();

      data.schedule.forEach((day) => {
        if (!dayMap.has(day.day_of_week)) {
          dayMap.set(day.day_of_week, {
            day_of_week: day.day_of_week,
            day_name: day.day_name,
            is_closed: day.is_closed,
            ranges: [],
          });
        }

        const config = dayMap.get(day.day_of_week);
        if (config && !day.is_closed) {
          config.ranges.push({
            open_at: day.open_at,
            close_at: day.close_at,
          });
        }
      });

      setSchedule(Array.from(dayMap.values()).sort((a, b) => a.day_of_week - b.day_of_week));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando horarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Horarios de Atención</h2>
        <p className="text-muted-foreground mt-1">Configura los horarios que se repiten cada semana (aplica a todos los lunes, martes, etc.)</p>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-900">
            💡 <strong>Nota:</strong> Estos horarios se aplican permanentemente. Por ejemplo, si configuras que los Lunes abren a las 9:00,
            todos los Lunes futuros abrirán a esa hora. Los cambios toman efecto inmediatamente.
          </p>
        </div>
      </div>

      <div className="border rounded-lg bg-white p-6">
        <div className="space-y-6">
          {schedule.map((day, dayIndex) => (
            <div key={dayIndex} className="pb-6 border-b last:border-b-0">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-lg">{day.day_name}</div>
                <button
                  onClick={() => handleClosedChange(dayIndex, !day.is_closed)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    day.is_closed
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {day.is_closed ? (
                    <>
                      <X className="inline h-4 w-4 mr-1" />
                      Cerrado
                    </>
                  ) : (
                    "Abierto"
                  )}
                </button>
              </div>

              {!day.is_closed && (
                <div className="space-y-3">
                  {day.ranges.map((range, rangeIndex) => (
                    <div key={rangeIndex} className="flex items-center gap-3">
                      <input
                        type="time"
                        value={range.open_at}
                        onChange={(e) => handleTimeChange(dayIndex, rangeIndex, "open_at", e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      />
                      <span className="text-muted-foreground">-</span>
                      <input
                        type="time"
                        value={range.close_at}
                        onChange={(e) => handleTimeChange(dayIndex, rangeIndex, "close_at", e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      />
                      {day.ranges.length > 1 && (
                        <button
                          onClick={() => handleRemoveRange(dayIndex, rangeIndex)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Eliminar rango"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddRange(dayIndex)}
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 mt-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar rango
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-1 bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Guardando..." : "Guardar Horarios"}
          </button>
          <button
            onClick={handleReset}
            disabled={saveMutation.isPending}
            className="px-4 py-2 rounded-md border font-medium hover:bg-muted disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Múltiples rangos:</strong> Puedes agregar varios rangos por día.
          Ejemplo: 09:00-12:00 (mañana) y 14:00-18:00 (tarde) para un descanso de comida.
        </p>
      </div>
    </div>
  );
}
