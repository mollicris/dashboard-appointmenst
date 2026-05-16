import { useQuery } from "@tanstack/react-query";
import { Scissors } from "lucide-react";
import { Badge } from "@shared/components/ui/Badge";
import { PageLoader } from "@shared/components/ui/LoadingSpinner";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { container } from "@infrastructure/di/container";
import { useCurrentBusiness } from "@features/appointments/hooks/useCurrentBusiness";

export function ServicesList() {
  const { businessId, isLoading: bizLoading } = useCurrentBusiness();

  const { data: services, isLoading, isError } = useQuery({
    queryKey: ["services", businessId],
    queryFn: () => {
      if (!businessId) throw new Error("No business");
      return container.listServicesUseCase.execute(businessId);
    },
    enabled: !!businessId,
  });

  if (bizLoading || isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Servicios</h1>

      {isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Error al cargar los servicios.
        </div>
      )}

      {services?.length === 0 && (
        <EmptyState
          title="Sin servicios"
          description="Agrega servicios desde la configuración de tu negocio."
          icon={<Scissors className="h-10 w-10" />}
        />
      )}

      {services && services.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Duración</th>
                <th className="px-4 py-3 text-left font-medium">Precio</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{service.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {service.durationMinutes} min
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {service.price > 0
                      ? `$${(service.price / 100).toFixed(0)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={service.isActive ? "Activo" : "Inactivo"}
                      variant={service.isActive ? "success" : "muted"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
