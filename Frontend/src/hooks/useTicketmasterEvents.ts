import { useCallback, useEffect, useState } from "react";
import { getTicketmasterEvents } from "../api/api";
import type { TicketmasterEvent } from "../types";

export function useTicketmasterEvents(initialQuery = "") {
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  const search = useCallback(async (query = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await getTicketmasterEvents(query);
      setEvents(response._embedded?.events ?? []);
      setPage(response.page?.number ?? 0);
      setTotalPages(response.page?.totalPages ?? 0);
      setActiveQuery(query);
    } catch {
      setEvents([]);
      setError("Não foi possível carregar o catálogo da Ticketmaster.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;

    if (loadingMore || nextPage >= totalPages) return;

    setLoadingMore(true);
    setError("");

    try {
      const response = await getTicketmasterEvents(activeQuery, nextPage);
      setEvents((current) => [
        ...current,
        ...(response._embedded?.events ?? []),
      ]);
      setPage(response.page?.number ?? nextPage);
      setTotalPages(response.page?.totalPages ?? totalPages);
    } catch {
      setError("Não foi possível carregar mais eventos.");
    } finally {
      setLoadingMore(false);
    }
  }, [activeQuery, loadingMore, page, totalPages]);

  useEffect(() => {
    async function loadInitialEvents() {
      try {
        const response = await getTicketmasterEvents(initialQuery);
        setEvents(response._embedded?.events ?? []);
        setPage(response.page?.number ?? 0);
        setTotalPages(response.page?.totalPages ?? 0);
        setActiveQuery(initialQuery);
      } catch {
        setError("Não foi possível carregar o catálogo da Ticketmaster.");
      } finally {
        setLoading(false);
      }
    }

    void loadInitialEvents();
  }, [initialQuery]);

  const hasMore = page + 1 < totalPages;

  return { events, loading, loadingMore, error, hasMore, search, loadMore };
}
