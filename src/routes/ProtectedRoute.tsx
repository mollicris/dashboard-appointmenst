import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@features/auth/store/authStore";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const rehydrate = useAuthStore((s) => s.rehydrate);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    rehydrate().finally(() => setChecking(false));
  }, [rehydrate]);

  if (checking) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.tenantStatus === "onboarding") return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
