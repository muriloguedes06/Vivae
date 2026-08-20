import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../api/api";
import type { UserRole } from "../types";

type GuestStatus =
  | { state: "checking" }
  | { state: "guest" }
  | { state: "authenticated"; role: UserRole };

const homeByRole: Record<UserRole, string> = {
  CUSTOMER: "/eventos",
  ORGANIZER: "/organizador",
  GATE_STAFF: "/portaria",
  ADMIN: "/organizador",
};

export function GuestOnlyRoute() {
  const hasToken = Boolean(
    localStorage.getItem("accessToken"),
  );
  const [status, setStatus] = useState<GuestStatus>(() =>
    hasToken ? { state: "checking" } : { state: "guest" },
  );

  useEffect(() => {
    async function checkSession() {
      if (!hasToken) return;

      try {
        const { user } = await getCurrentUser();
        localStorage.setItem("user", JSON.stringify(user));
        setStatus({ state: "authenticated", role: user.role });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setStatus({ state: "guest" });
      }
    }

    void checkSession();
  }, [hasToken]);

  if (status.state === "checking") {
    return <main className="center-page">Verificando sessão...</main>;
  }

  if (status.state === "authenticated") {
    return <Navigate to={homeByRole[status.role]} replace />;
  }

  return <Outlet />;
}
