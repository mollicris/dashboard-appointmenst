import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, MessageCircle } from "lucide-react";
import { container } from "@infrastructure/di/container";

interface Props {
  businessId: string;
}

interface FormValues {
  phoneNumberId: string;
  appSecret: string;
  ownerWhatsapp: string;
}

export function WhatsAppConfig({ businessId }: Props) {
  const queryClient = useQueryClient();
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { data: business } = useQuery({
    queryKey: ["business-detail", businessId],
    queryFn: () => container.getBusinessUseCase.execute(businessId),
    enabled: !!businessId,
  });

  const [values, setValues] = useState<FormValues>({
    phoneNumberId: "",
    appSecret: "",
    ownerWhatsapp: "",
  });

  useEffect(() => {
    if (business && !initialized) {
      setValues({
        phoneNumberId: business.whatsappPhoneNumberId ?? "",
        appSecret: "",
        ownerWhatsapp: business.ownerWhatsapp ?? "",
      });
      setInitialized(true);
    }
  }, [business, initialized]);

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const mutation = useMutation({
    mutationFn: () =>
      container.updateBusinessWhatsappUseCase.execute(businessId, {
        phoneNumberId: values.phoneNumberId.trim() || null,
        appSecret: values.appSecret.trim() || null,
        ownerWhatsapp: values.ownerWhatsapp.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-detail", businessId] });
      setSaved(true);
      setError(null);
      setValues((v) => ({ ...v, appSecret: "" }));
      setTimeout(() => setSaved(false), 3000);
    },
    onError: () => setError("No se pudo guardar la configuración. Intenta de nuevo."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  };

  const hasSecret = business?.hasWhatsappAppSecret ?? false;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-green-600" />
        <div>
          <h2 className="text-xl font-semibold">Configuración de WhatsApp</h2>
          <p className="text-sm text-muted-foreground">
            Conecta tu número de WhatsApp Business para recibir y enviar mensajes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Phone Number ID</label>
          <input
            type="text"
            value={values.phoneNumberId}
            onChange={(e) => set("phoneNumberId", e.target.value)}
            placeholder="Ej: 123456789012345"
            className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Meta for Developers → WhatsApp → API Setup → Phone Number ID.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            App Secret
            {hasSecret && !values.appSecret && (
              <span className="ml-2 text-xs font-normal text-green-600">● Configurado</span>
            )}
          </label>
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={values.appSecret}
              onChange={(e) => set("appSecret", e.target.value)}
              placeholder={
                hasSecret
                  ? "Dejar en blanco para mantener el actual"
                  : "Pegar App Secret de Meta"
              }
              className="w-full rounded-md border px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Verifica la firma HMAC de los webhooks entrantes.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            WhatsApp del propietario
            <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            type="tel"
            value={values.ownerWhatsapp}
            onChange={(e) => set("ownerWhatsapp", e.target.value)}
            placeholder="Ej: +591 70000000"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Número al que se notifican las transferencias a humano.
          </p>
        </div>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {mutation.isPending ? "Guardando…" : "Guardar configuración"}
          </button>
          {saved && (
            <span className="text-sm text-green-600">Guardado correctamente</span>
          )}
        </div>
      </form>
    </div>
  );
}
