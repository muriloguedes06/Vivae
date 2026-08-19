import type { EventCategory, EventItem, LocalEvent, LocalEventCategory } from "../types";

const labels: Record<LocalEventCategory, EventCategory> = {
  CONCERT: "Show",
  MOVIE: "Filme",
  FESTIVAL: "Festival",
  CONFERENCE: "Show",
  WORKSHOP: "Show",
  THEATER: "Show",
  SPORTS: "Show",
  OTHER: "Show",
};

export function localEventToEventItem(event: LocalEvent): EventItem {
  return {
    id: event.id,
    title: event.title,
    date: new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(event.startsAt)),
    venue: event.venueName,
    city: event.city,
    price: event.minPrice,
    maxPrice: event.maxPrice,
    currency: "BRL",
    category: labels[event.category],
    image: event.coverUrl ?? "https://placehold.co/800x450?text=Vivaê",
    sourceDate: event.startsAt.slice(0, 10),
    description: event.description,
  };
}

export function ticketmasterCategory(segment?: string, genre?: string): LocalEventCategory {
  const value = `${segment ?? ""} ${genre ?? ""}`.toLowerCase();
  if (value.includes("film") || value.includes("movie")) return "MOVIE";
  if (value.includes("festival")) return "FESTIVAL";
  if (value.includes("sport")) return "SPORTS";
  if (value.includes("theatre") || value.includes("theater")) return "THEATER";
  if (value.includes("music")) return "CONCERT";
  return "OTHER";
}
