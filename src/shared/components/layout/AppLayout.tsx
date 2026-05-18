import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  MessageCircle,
  Scissors,
  Users,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@shared/lib/cn";
import { useAuthStore } from "@features/auth/store/authStore";
import { container } from "@infrastructure/di/container";
import { TokenStorage } from "@infrastructure/auth/TokenStorage";

const navigation = [
  { to: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { to: "/appointments", label: "Citas", icon: CalendarDays },
  { to: "/conversations", label: "Conversaciones", icon: MessageCircle },
  { to: "/services", label: "Servicios", icon: Scissors },
  { to: "/professionals", label: "Profesionales", icon: Users },
  { to: "/businesses", label: "Sucursales", icon: Building2 },
  { to: "/settings", label: "Configuración", icon: Settings },
];

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = TokenStorage.getRefreshToken();
    if (refreshToken) {
      await container.logoutUseCase.execute(refreshToken).catch(() => {});
    }
    clearAuth();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r bg-muted/30">
        <div className="border-b p-4">
          <h1 className="text-lg font-bold tracking-tight">Agente Citas</h1>
          {user && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-3">
          <button
            onClick={() => { void handleLogout(); }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
