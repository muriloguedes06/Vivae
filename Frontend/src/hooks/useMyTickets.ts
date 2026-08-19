import { useEffect, useState } from "react";
import { getMyTicket, getMyTickets } from "../api/api";
import type { MyTicket } from "../types";

export function useMyTickets() {
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        setTickets(await getMyTickets());
      } catch {
        setError("Não foi possível carregar seus ingressos.");
      } finally {
        setLoading(false);
      }
    }

    void loadTickets();
  }, []);

  return { tickets, loading, error };
}

export function useMyTicket(id: string | null) {
  const [ticket, setTicket] = useState<MyTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTicket() {
      if (!id) {
        setError("Ingresso não informado.");
        setLoading(false);
        return;
      }

      try {
        setTicket(await getMyTicket(id));
      } catch {
        setError("Ingresso não encontrado ou sem permissão de acesso.");
      } finally {
        setLoading(false);
      }
    }

    void loadTicket();
  }, [id]);

  return { ticket, loading, error };
}
