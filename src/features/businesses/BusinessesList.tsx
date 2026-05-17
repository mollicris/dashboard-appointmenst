import { useQuery } from "@tanstack/react-query";
import { Building2, Mail, Phone } from "lucide-react";
import { Badge } from "@shared/components/ui/Badge";
import { PageLoader } from "@shared/components/ui/LoadingSpinner";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { container } from "@infrastructure/di/container";

export function BusinessesList() {
  const { data: businesses, isLoading, isError } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => container.listBusinessesUseCase.execute(),
    staleTime: 5 * 60_000,
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Sucursales</h1>

      {isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Error al cargar las sucursales.
        </div>
      )}

      {businesses?.length === 0 && (
        <EmptyState
          title="Sin sucursales"
          description="Crea tu primera sucursal para empezar."
          icon={<Building2 className="h-10 w-10" />}
        />
      )}

      {businesses && businesses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((biz) => (
            <div key={biz.id} className="rounded-lg border bg-background p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{biz.name}</h3>
                  <p className="text-xs text-muted-foreground">{biz.slug}</p>
                </div>
                <Badge
                  label={biz.isActive ? "Activa" : "Inactiva"}
                  variant={biz.isActive ? "success" : "muted"}
                />
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                {biz.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{biz.email}</span>
                  </div>
                )}
                {biz.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{biz.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
