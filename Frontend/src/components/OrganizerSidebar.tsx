import { NavLink } from "react-router-dom";
import { Icon } from "./Icon";

export function OrganizerSidebar() {
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
          <NavLink key={label} to={path}>
            <Icon>{icon}</Icon>
            {label}
          </NavLink>
        ))}
      </nav>
      <footer>
        <a href="#help">
          <Icon>help</Icon>Central de ajuda
        </a>
        <NavLink to="/login">
          <Icon>logout</Icon>Logout
        </NavLink>
      </footer>
    </aside>
  );
}
