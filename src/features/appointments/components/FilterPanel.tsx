interface FilterPanelProps {
  readonly statusFilter: string[];
  readonly onStatusFilterChange: (statuses: string[]) => void;
  readonly viewMode: "month" | "week" | "day";
  readonly onViewModeChange: (mode: "month" | "week" | "day") => void;
}

export function FilterPanel({
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
}: FilterPanelProps) {
  const statuses = ["pending", "confirmed", "cancelled", "rescheduled"] as const;

  const toggleStatus = (status: string) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter((s) => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };

  const statusLabels = {
    pending: { label: "Pendientes", color: "bg-amber-100 text-amber-700" },
    confirmed: { label: "Confirmadas", color: "bg-green-100 text-green-700" },
    cancelled: { label: "Canceladas", color: "bg-red-100 text-red-700" },
    rescheduled: { label: "Reagendadas", color: "bg-blue-100 text-blue-700" },
  } as const;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/30 p-4">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 border-r pr-4">
        <span className="text-xs font-medium text-muted-foreground">Vista:</span>
        <div className="flex gap-1">
          {(["month", "week", "day"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === mode
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground hover:bg-muted"
              }`}
            >
              {mode === "month" && "Mes"}
              {mode === "week" && "Semana"}
              {mode === "day" && "Día"}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Estado:</span>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              statusFilter.includes(status)
                ? statusLabels[status].color
                : "bg-white text-muted-foreground hover:bg-muted"
            }`}
          >
            {statusLabels[status].label}
          </button>
        ))}
      </div>

      {/* Reset */}
      {statusFilter.length < statuses.length && (
        <button
          onClick={() => onStatusFilterChange([...statuses])}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground"
        >
          Mostrar todo
        </button>
      )}
    </div>
  );
}
