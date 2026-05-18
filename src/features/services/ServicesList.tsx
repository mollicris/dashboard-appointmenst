import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Scissors, Trash2, X } from "lucide-react";
import { Badge } from "@shared/components/ui/Badge";
import { PageLoader } from "@shared/components/ui/LoadingSpinner";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { container } from "@infrastructure/di/container";
import { useCurrentBusiness } from "@features/appointments/hooks/useCurrentBusiness";
import type { Service } from "@domain/service/Service";

// ── Modal ────────────────────────────────────────────────────────────────────

interface ServiceFormValues {
  name: string;
  durationMinutes: string;
  description: string;
  price: string;
  professionalIds: string[];
}

const EMPTY: ServiceFormValues = {
  name: "",
  durationMinutes: "30",
  description: "",
  price: "",
  professionalIds: [],
};

function toFormValues(svc: Service): ServiceFormValues {
  return {
    name: svc.name,
    durationMinutes: String(svc.durationMinutes),
    description: svc.description ?? "",
    price: svc.price != null ? String(svc.price / 100) : "",
    professionalIds: svc.professionalIds ?? [],
  };
}

interface ServiceModalProps {
  businessId: string;
  editing: Service | null;
  onClose: () => void;
}

function ServiceModal({ businessId, editing, onClose }: ServiceModalProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ServiceFormValues>(
    editing ? toFormValues(editing) : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);

  const { data: professionals } = useQuery({
    queryKey: ["professionals", businessId],
    queryFn: () => container.listProfessionalsUseCase.execute(businessId),
    enabled: !!businessId,
  });

  const set = <K extends keyof ServiceFormValues>(k: K, v: ServiceFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const toggleProfessional = (id: string) =>
    setValues((prev) => ({
      ...prev,
      professionalIds: prev.professionalIds.includes(id)
        ? prev.professionalIds.filter((x) => x !== id)
        : [...prev.professionalIds, id],
    }));

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await container.createServiceUseCase.execute(businessId, {
        name: values.name.trim(),
        durationMinutes: parseInt(values.durationMinutes),
        description: values.description.trim() || null,
        price: values.price ? Math.round(parseFloat(values.price) * 100) : null,
      });
      if (values.professionalIds.length > 0) {
        await container.assignProfessionalsToServiceUseCase.execute(
          businessId,
          created.id,
          values.professionalIds,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", businessId] });
      onClose();
    },
    onError: () => setError("No se pudo crear el servicio. Intenta de nuevo."),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await container.updateServiceUseCase.execute(businessId, editing!.id, {
        name: values.name.trim(),
        durationMinutes: parseInt(values.durationMinutes),
        description: values.description.trim() || null,
        price: values.price ? Math.round(parseFloat(values.price) * 100) : null,
      });
      await container.assignProfessionalsToServiceUseCase.execute(
        businessId,
        editing!.id,
        values.professionalIds,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", businessId] });
      onClose();
    },
    onError: () => setError("No se pudo actualizar el servicio. Intenta de nuevo."),
  });

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.name.trim()) { setError("El nombre es requerido."); return; }
    if (!values.durationMinutes || parseInt(values.durationMinutes) < 1) { setError("La duración debe ser mayor a 0."); return; }
    editing ? updateMutation.mutate() : createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">{editing ? "Editar servicio" : "Nuevo servicio"}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nombre *</label>
            <input
              type="text"
              required
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej: Corte de cabello"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Descripción</label>
            <input
              type="text"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Opcional"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Duración (min) *</label>
              <input
                type="number"
                required
                min={1}
                max={480}
                value={values.durationMinutes}
                onChange={(e) => set("durationMinutes", e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Precio</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={values.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="Opcional"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Profesionales que lo realizan
              <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
            </label>
            {professionals && professionals.length > 0 ? (
              <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border p-2.5">
                {professionals.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={values.professionalIds.includes(p.id)}
                      onChange={() => toggleProfessional(p.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{p.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                No hay profesionales registrados. Crea profesionales primero para asignarlos.
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Si no asignas a nadie, cualquier profesional podrá realizar este servicio.
            </p>
          </div>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Guardando…" : editing ? "Guardar cambios" : "Crear servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main list ────────────────────────────────────────────────────────────────

export function ServicesList() {
  const { businessId, isLoading: bizLoading } = useCurrentBusiness();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: services, isLoading, isError } = useQuery({
    queryKey: ["services", businessId],
    queryFn: () => {
      if (!businessId) throw new Error("No business");
      return container.listServicesUseCase.execute(businessId);
    },
    enabled: !!businessId,
  });

  const deleteMutation = useMutation({
    mutationFn: (serviceId: string) =>
      container.deleteServiceUseCase.execute(businessId!, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", businessId] });
      setDeletingId(null);
    },
  });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (svc: Service) => { setEditing(svc); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  if (bizLoading || isLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo servicio
        </button>
      </div>

      {isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Error al cargar los servicios.
        </div>
      )}

      {services?.length === 0 && (
        <EmptyState
          title="Sin servicios"
          description="Crea tu primer servicio para empezar a recibir citas."
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
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="font-medium">{svc.name}</div>
                    {svc.description && (
                      <div className="mt-0.5 text-xs text-muted-foreground">{svc.description}</div>
                    )}
                    {svc.professionalIds.length > 0 && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {svc.professionalIds.length} profesional{svc.professionalIds.length === 1 ? "" : "es"} asignado{svc.professionalIds.length === 1 ? "" : "s"}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{svc.durationMinutes} min</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {svc.price != null && svc.price > 0
                      ? `$${(svc.price / 100).toFixed(0)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={svc.isActive ? "Activo" : "Inactivo"}
                      variant={svc.isActive ? "success" : "muted"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(svc)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {deletingId === svc.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteMutation.mutate(svc.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
                          >
                            {deleteMutation.isPending ? "…" : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(svc.id)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && businessId && (
        <ServiceModal businessId={businessId} editing={editing} onClose={closeModal} />
      )}
    </div>
  );
}
