import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarDays, CheckCircle, Clock, Store } from "lucide-react";
import { PageLoader } from "@shared/components/ui/LoadingSpinner";
import { container } from "@infrastructure/di/container";
import { useCurrentBusiness } from "@features/appointments/hooks/useCurrentBusiness";
import { useAuthStore } from "@features/auth/store/authStore";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ label, value, icon, description }: Readonly<StatCardProps>) {
  return (
    <div className="rounded-lg border bg-background p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const today = format(new Date(), "yyyy-MM-dd");
  const { business, businessId, isLoading: bizLoading } = useCurrentBusiness();

  const { data: todayData, isLoading: aptLoading } = useQuery({
    queryKey: ["appointments", businessId, today, 1],
    queryFn: () => {
      if (!businessId) throw new Error("No business");
      return container.listAppointmentsUseCase.execute({
        businessId,
        onDate: today,
        page: 1,
        pageSize: 100,
      });
    },
    enabled: !!businessId,
  });

  const { data: services, isLoading: svcLoading } = useQuery({
    queryKey: ["services", businessId],
    queryFn: () => {
      if (!businessId) throw new Error("No business");
      return container.listServicesUseCase.execute(businessId);
    },
    enabled: !!businessId,
  });

  if (bizLoading || aptLoading || svcLoading) return <PageLoader />;

  const pendingCount = todayData?.items.filter((a) => a.status === "pending").length ?? 0;
  const confirmedCount = todayData?.items.filter((a) => a.status === "confirmed").length ?? 0;
  const totalToday = todayData?.total ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Bienvenido{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {business?.name ?? "—"} · {format(new Date(), "EEEE d 'de' MMMM, yyyy")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Citas hoy"
          value={totalToday}
          icon={<CalendarDays className="h-5 w-5" />}
          description={format(new Date(), "d MMM yyyy")}
        />
        <StatCard
          label="Pendientes"
          value={pendingCount}
          icon={<Clock className="h-5 w-5" />}
          description="Esperando confirmación"
        />
        <StatCard
          label="Confirmadas"
          value={confirmedCount}
          icon={<CheckCircle className="h-5 w-5" />}
          description="Para hoy"
        />
        <StatCard
          label="Servicios activos"
          value={services?.filter((s) => s.isActive).length ?? 0}
          icon={<Store className="h-5 w-5" />}
          description="En el catálogo"
        />
      </div>

      {todayData && todayData.items.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Próximas citas de hoy</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Hora</th>
                  <th className="px-4 py-3 text-left font-medium">Duración</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {todayData.items.slice(0, 5).map((apt) => (
                  <tr key={apt.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">
                      {format(apt.scheduledAt, "HH:mm")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {apt.durationMinutes} min
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-muted-foreground">{apt.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
