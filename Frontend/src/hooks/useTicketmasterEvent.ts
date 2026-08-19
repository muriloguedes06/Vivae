import { useEffect, useState } from "react";
import { getTicketmasterEvent } from "../api/api";
import type { TicketmasterEvent } from "../types";

export function useTicketmasterEvent(id?: string) {
  const [event, setEvent] = useState<TicketmasterEvent>();
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadEvent(eventId: string) {
      try {
        const response = await getTicketmasterEvent(eventId);
        setEvent(response);
      } catch {
        setError("Não foi possível carregar os detalhes do evento.");
      } finally {
        setLoading(false);
      }
    }

    void loadEvent(id);
  }, [id]);

  return { event, loading, error };
}
