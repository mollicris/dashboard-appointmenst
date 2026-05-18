import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Building2, Phone, Clock, Scissors } from "lucide-react";
import { httpClient } from "@core/api/http-client";
import { useAuthStore } from "@features/auth/store/authStore";

interface DefaultService {
  name: string;
  description: string;
  duration_minutes: number;
}

interface WizardState {
  tenant_id: string;
  tenant_name: string;
  industry: string;
  status: string;
  suggested_business_name: string;
  default_open_at: string;
  default_close_at: string;
  open_days: string[];
  default_services: DefaultService[];
}

const DAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const rehydrate = useAuthStore((s) => s.rehydrate);

  const [wizardState, setWizardState] = useState<WizardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const timezone = "UTC";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    httpClient
      .get<WizardState>("/api/v1/wizard/state")
      .then((data) => {
        setWizardState(data);
        setBusinessName(data.suggested_business_name);
      })
      .catch(() => setError("No pudimos cargar la configuración. Recarga la página."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) { setError("El nombre del negocio es requerido."); return; }
    if (!phone.trim()) { setError("El teléfono es requerido."); return; }

    setError(null);
    setSubmitting(true);
    try {
      await httpClient.post("/api/v1/wizard/complete", {
        business_name: businessName.trim(),
        phone: phone.trim(),
        timezone,
      });
      setDone(true);
      await rehydrate();
      setTimeout(() => navigate("/dashboard", { replace: true }), 1800);
    } catch {
      setError("No pudimos activar tu cuenta. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="mx-auto max-w-md rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">¡Listo para empezar!</h1>
          <p className="mt-3 text-sm text-muted-foreground">Redirigiendo a tu panel…</p>
        </div>
      </div>
    );
  }

  const closedDays = DAY_LABELS.filter(
    (d) => !(wizardState?.open_days ?? []).includes(d)
  );

  return (
    <div className="flex min-h-screen items-start justify-center bg-muted/30 px-4 pt-16 pb-20">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Configura tu negocio</h1>
          <p className="mt-2 text-muted-foreground">
            Último paso para activar tu agente de citas.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border bg-white p-8 shadow-sm"
        >
          {/* Business name */}
          <div>
            <label htmlFor="biz-name" className="flex items-center gap-1.5 text-sm font-medium">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Nombre del negocio
            </label>
            <input
              id="biz-name"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ej: Peluquería Lucía"
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Teléfono de contacto
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+591 7XXXXXXX"
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Default hours preview */}
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Horario predeterminado
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Puedes ajustarlo después desde Configuración → Horarios.
            </p>
            <div className="mt-3 space-y-1">
              {(wizardState?.open_days ?? []).map((day) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="text-foreground">{day}</span>
                  <span className="font-medium">
                    {wizardState?.default_open_at} – {wizardState?.default_close_at}
                  </span>
                </div>
              ))}
              {closedDays.map((day) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="text-foreground">{day}</span>
                  <span className="text-muted-foreground">Cerrado</span>
                </div>
              ))}
            </div>
          </div>

          {/* Default services preview */}
          {(wizardState?.default_services ?? []).length > 0 && (
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Scissors className="h-4 w-4 text-muted-foreground" />
                Servicios incluidos
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Se crearán automáticamente. Puedes editarlos después en Servicios.
              </p>
              <ul className="mt-3 space-y-1.5">
                {wizardState?.default_services.map((svc) => (
                  <li key={svc.name} className="flex items-start justify-between gap-2 text-sm">
                    <span className="text-foreground">{svc.name}</span>
                    <span className="shrink-0 text-muted-foreground">{svc.duration_minutes} min</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Activando…
              </>
            ) : (
              "Activar mi agente"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
