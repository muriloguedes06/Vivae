import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import type { UserRole } from "../types";

export function Logo() {
  return (
    <NavLink className="logo" to="/eventos">
      <Icon>confirmation_number</Icon> Vivaê
    </NavLink>
  );
}

interface AppHeaderProps {
  onSearch?: (query: string) => void;
}

export function AppHeader({ onSearch }: AppHeaderProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const storedUser = localStorage.getItem("user");
  const user = storedUser
    ? (JSON.parse(storedUser) as {
        username?: string;
        email?: string;
        role?: UserRole;
      })
    : null;

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();

    if (onSearch) {
      onSearch(value);
      return;
    }

    navigate(`/eventos?query=${encodeURIComponent(value)}`);
  }

  return (
    <header className="app-header">
      <Logo />
      <nav className="main-nav">
        <NavLink to="/eventos">Discover</NavLink>
        <NavLink to="/meus-ingressos">Calendar</NavLink>
        <a href="#help">Help</a>
      </nav>
      <form className="header-search" onSubmit={submitSearch}>
        <Icon>search</Icon>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar eventos pelo nome"
        />
        <button type="submit" aria-label="Buscar">
          Buscar
        </button>
      </form>
      <div className="header-actions">
        <button
          className="account-button"
          type="button"
          aria-label="Abrir menu da conta"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon>account_circle</Icon>
        </button>
        {menuOpen && (
          <div className="account-menu">
            {user ? (
              <>
                <div className="account-summary">
                  <b>{user.username ?? "Minha conta"}</b>
                  <small>{user.email}</small>
                </div>
                <NavLink to="/meus-ingressos">Meus ingressos</NavLink>
                {(user.role === "ORGANIZER" || user.role === "ADMIN") && (
                  <NavLink to="/organizador">Painel do organizador</NavLink>
                )}
                {(user.role === "GATE_STAFF" || user.role === "ADMIN") && (
                  <NavLink to="/portaria">Acessar portaria</NavLink>
                )}
                <button type="button" onClick={logout}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Entrar</NavLink>
                <NavLink to="/criar-conta">Criar conta</NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
