import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../api/api";
import type { UserRole } from "../types";

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

type AccessStatus = "checking" | "allowed" | "forbidden" | "unauthenticated";

export function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const location = useLocation();
  const [status, setStatus] = useState<AccessStatus>(() =>
    localStorage.getItem("accessToken") ? "checking" : "unauthenticated",
  );

  useEffect(() => {
    async function checkAccess() {
      if (!localStorage.getItem("accessToken")) {
        return;
      }

      try {
        const { user } = await getCurrentUser();
        localStorage.setItem("user", JSON.stringify(user));
        setStatus(allowedRoles.includes(user.role) ? "allowed" : "forbidden");
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setStatus("unauthenticated");
      }
    }

    void checkAccess();
  }, [allowedRoles]);

  if (status === "checking") {
    return <main className="center-page">Verificando acesso...</main>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (status === "forbidden") {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <Outlet />;
}
