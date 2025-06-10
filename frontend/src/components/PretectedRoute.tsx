import { Navigate } from "react-router-dom";
import { useStores } from "../stores/useStores";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  isAdminRoute?: boolean;
}

export function ProtectedRoute({
  children,
  isAdminRoute = false,
}: ProtectedRouteProps) {
  const { authStore } = useStores();

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  // Если это админский маршрут и пользователь не суперпользователь, перенаправляем на главную
  if (isAdminRoute && authStore.user && !authStore.user.is_superuser) {
    return <Navigate to="/map" />;
  }
  return <>{children}</>;
}
