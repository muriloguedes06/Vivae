import { useEffect, useState } from "react";
import { getOrganizerEvent, getOrganizerEvents, getPublishedEvent, getPublishedEvents } from "../api/api";
import type { LocalEvent } from "../types";

export function usePublishedEvents() {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublishedEvents()
      .then(setEvents)
      .catch(() => setError("Não foi possível carregar os eventos publicados."))
      .finally(() => setLoading(false));
  }, []);
  return { events, loading, error };
}

export function usePublishedEvent(id?: string) {
  const [event, setEvent] = useState<LocalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      if (!id) {
        setError("Evento não informado.");
        setLoading(false);
        return;
      }
      try {
        setEvent(await getPublishedEvent(id));
      } catch {
        setError("Evento publicado não encontrado.");
      } finally {
        setLoading(false);
      }
    }
    void loadEvent();
  }, [id]);
  return { event, loading, error };
}

export function useOrganizerEvents() {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrganizerEvents()
      .then(setEvents)
      .catch(() => setError("Não foi possível carregar seus eventos."))
      .finally(() => setLoading(false));
  }, []);
  return { events, loading, error };
}

export function useOrganizerEvent(id?: string) {
  const [event, setEvent] = useState<LocalEvent | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getOrganizerEvent(id)
      .then(setEvent)
      .catch(() => setError("Evento do organizador não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);
  return { event, loading, error };
}
