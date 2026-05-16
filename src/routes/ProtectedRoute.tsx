import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@features/auth/store/authStore";

export function ProtectedRoute() {
  const { isAuthenticated, rehydrate } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    rehydrate: s.rehydrate,
  }));
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    rehydrate().finally(() => setChecking(false));
  }, [rehydrate]);

  if (checking) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
