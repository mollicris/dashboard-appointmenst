import { cn } from "@shared/lib/cn";
import type { AppointmentStatus } from "@domain/appointment/AppointmentStatus";
import { APPOINTMENT_STATUS_LABELS } from "@domain/appointment/AppointmentStatus";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  muted: "bg-muted text-muted-foreground",
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ label, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}

const STATUS_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "danger",
  rescheduled: "default",
  completed: "muted",
  no_show: "danger",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge
      label={APPOINTMENT_STATUS_LABELS[status]}
      variant={STATUS_VARIANT[status]}
    />
  );
}
