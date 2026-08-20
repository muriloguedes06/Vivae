import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import {
  EventDetailsPage,
  EventsPage,
  TicketSelectionPage,
} from "./pages/EventsPages";
import {
  EventCatalogPage,
  ConfigureEventPage,
  OrganizerDashboardPage,
  OrganizerEventsPage,
} from "./pages/OrganizerPages";
import { CheckoutPage, SeatsPage, SuccessPage } from "./pages/PurchasePages";
import { DigitalTicketPage, MyTicketsPage, SharedTicketPage } from "./pages/MyTicketsPages";
import {
  GateValidationResultPage,
  SmartScannerPage,
} from "./pages/GatePages";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import { GuestOnlyRoute } from "./components/GuestOnlyRoute";
import { AccessDeniedPage } from "./pages/AccessDeniedPage";
import type { UserRole } from "./types";

const organizerRoles: UserRole[] = ["ORGANIZER", "ADMIN"];
const gateRoles: UserRole[] = ["GATE_STAFF", "ADMIN"];
const customerRoles: UserRole[] = ["CUSTOMER", "ADMIN"];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/eventos" replace />} />
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/criar-conta" element={<RegisterPage />} />
        </Route>
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/eventos/:id" element={<EventDetailsPage />} />
        <Route path="/ingresso-compartilhado/:shareToken" element={<SharedTicketPage />} />
        <Route element={<RoleProtectedRoute allowedRoles={customerRoles} />}>
          <Route path="/ingressos" element={<TicketSelectionPage />} />
          <Route path="/assentos" element={<SeatsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/sucesso" element={<SuccessPage />} />
          <Route path="/meus-ingressos" element={<MyTicketsPage />} />
          <Route path="/ingresso-digital" element={<DigitalTicketPage />} />
        </Route>
        <Route element={<RoleProtectedRoute allowedRoles={organizerRoles} />}>
          <Route path="/organizador" element={<OrganizerDashboardPage />} />
          <Route path="/organizador/eventos" element={<OrganizerEventsPage />} />
          <Route path="/organizador/catalogo" element={<EventCatalogPage />} />
          <Route path="/organizador/configurar" element={<ConfigureEventPage />} />
        </Route>
        <Route element={<RoleProtectedRoute allowedRoles={gateRoles} />}>
          <Route path="/portaria" element={<SmartScannerPage />} />
          <Route path="/portaria/scanner" element={<Navigate to="/portaria" replace />} />
          <Route path="/portaria/resultado" element={<GateValidationResultPage />} />
        </Route>
        <Route path="/acesso-negado" element={<AccessDeniedPage />} />
        <Route path="*" element={<Navigate to="/eventos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
