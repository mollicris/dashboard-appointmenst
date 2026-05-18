import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingSpinner } from "@shared/components/ui/LoadingSpinner";
import { useAuthStore } from "./store/authStore";
import { container } from "@infrastructure/di/container";
import { ApiError } from "@core/api/http-client";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const { token, user } = await container.loginUseCase.execute(data);
      setAuth(token, user);
      navigate(user.tenantStatus === "onboarding" ? "/onboarding" : "/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Credenciales incorrectas");
      } else {
        toast.error("Error al iniciar sesión. Intenta de nuevo.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Agente Citas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ingresa a tu dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@empresa.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            {isSubmitting ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
