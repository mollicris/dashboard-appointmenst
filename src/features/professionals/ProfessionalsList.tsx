import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { Badge } from "@shared/components/ui/Badge";
import { PageLoader } from "@shared/components/ui/LoadingSpinner";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { container } from "@infrastructure/di/container";
import { useCurrentBusiness } from "@features/appointments/hooks/useCurrentBusiness";
import type { Professional } from "@domain/professional/Professional";

// ── Modal ────────────────────────────────────────────────────────────────────

interface ProfessionalFormValues {
  name: string;
  phone: string;
}

const EMPTY: ProfessionalFormValues = { name: "", phone: "" };

function toFormValues(p: Professional): ProfessionalFormValues {
  return { name: p.name, phone: p.phone ?? "" };
}

interface ProfessionalModalProps {
  businessId: string;
  editing: Professional | null;
  onClose: () => void;
}

function ProfessionalModal({ businessId, editing, onClose }: ProfessionalModalProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ProfessionalFormValues>(
    editing ? toFormValues(editing) : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProfessionalFormValues>(k: K, v: ProfessionalFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const createMutation = useMutation({
    mutationFn: () =>
      container.createProfessionalUseCase.execute(businessId, {
        name: values.name.trim(),
        phone: values.phone.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals", businessId] });
      onClose();
    },
    onError: () => setError("No se pudo crear el profesional. Intenta de nuevo."),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      container.updateProfessionalUseCase.execute(businessId, editing!.id, {
        name: values.name.trim(),
        phone: values.phone.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals", businessId] });
      onClose();
    },
    onError: () => setError("No se pudo actualizar el profesional. Intenta de nuevo."),
  });

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.name.trim()) { setError("El nombre es requerido."); return; }
    editing ? updateMutation.mutate() : createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">{editing ? "Editar profesional" : "Nuevo profesional"}</h2>
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
              placeholder="Ej: María González"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Teléfono</label>
            <input
              type="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="Ej: +591 70000000"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
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
              {submitting ? "Guardando…" : editing ? "Guardar cambios" : "Crear profesional"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main list ────────────────────────────────────────────────────────────────

export function ProfessionalsList() {
  const { businessId, isLoading: bizLoading } = useCurrentBusiness();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: professionals, isLoading, isError } = useQuery({
    queryKey: ["professionals", businessId],
    queryFn: () => {
      if (!businessId) throw new Error("No business");
      return container.listProfessionalsUseCase.execute(businessId);
    },
    enabled: !!businessId,
  });

  const deleteMutation = useMutation({
    mutationFn: (professionalId: string) =>
      container.deleteProfessionalUseCase.execute(businessId!, professionalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals", businessId] });
      setDeletingId(null);
    },
  });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Professional) => { setEditing(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  if (bizLoading || isLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profesionales</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo profesional
        </button>
      </div>

      {isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Error al cargar los profesionales.
        </div>
      )}

      {professionals?.length === 0 && (
        <EmptyState
          title="Sin profesionales"
          description="Agrega el equipo de trabajo para asignarlos a las citas."
          icon={<Users className="h-10 w-10" />}
        />
      )}

      {professionals && professionals.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {professionals.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge
                      label={p.isActive ? "Activo" : "Inactivo"}
                      variant={p.isActive ? "success" : "muted"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {deletingId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteMutation.mutate(p.id)}
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
                          onClick={() => setDeletingId(p.id)}
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
        <ProfessionalModal businessId={businessId} editing={editing} onClose={closeModal} />
      )}
    </div>
  );
}
