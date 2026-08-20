import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { logoutSession } from "../api/connect";

export function OrganizerSidebar() {
  const navigate = useNavigate();

  async function logout() {
    try {
      await logoutSession();
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }

  const items = [
    ["dashboard", "Dashboard", "/organizador"],
    ["calendar_month", "Eventos", "/organizador/eventos"],
    ["confirmation_number", "Catálogo", "/organizador/catalogo"],
  ];
  return (
    <aside className="organizer-sidebar">
      <div>
        <b>Vivaê</b>
        <small>Painel do organizador</small>
      </div>
      <nav>
        {items.map(([icon, label, path]) => (
          <NavLink key={label} to={path} end={path === "/organizador"}>
            <Icon>{icon}</Icon>
            {label}
          </NavLink>
        ))}
      </nav>
      <footer>
        <NavLink to="/eventos">
          <Icon>home</Icon>Voltar ao início
        </NavLink>
        <a href="#help">
          <Icon>help</Icon>Central de ajuda
        </a>
        <button type="button" onClick={() => void logout()}>
          <Icon>logout</Icon>Logout
        </button>
      </footer>
    </aside>
  );
}
