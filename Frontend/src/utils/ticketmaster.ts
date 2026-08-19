import type { EventItem, TicketmasterEvent } from "../types";

export function ticketmasterToEventItem(event: TicketmasterEvent): EventItem {
  const venue = event._embedded?.venues?.[0];
  const image =
    event.images?.find(
      (item) => item.ratio === "16_9" && !item.fallback && item.width,
    ) ?? event.images?.[0];
  const start = event.dates?.start;
  const segment = event.classifications?.[0]?.segment?.name?.toLowerCase();
  const genre = event.classifications?.[0]?.genre?.name?.toLowerCase();
  const category =
    segment === "film"
      ? "Filme"
      : genre?.includes("festival")
        ? "Festival"
        : "Show";
  const date = start?.localDate
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(`${start.localDate}T12:00:00`))
    : "Data não informada";
  const priceRange = event.priceRanges?.find(
    (range) => range.type === "standard",
  ) ?? event.priceRanges?.[0];
  const attraction = event._embedded?.attractions?.[0];
  const description =
    event.description ??
    event.info ??
    event.additionalInfo ??
    attraction?.description ??
    attraction?.additionalInfo;

  return {
    id: event.id,
    title: event.name,
    date: `${date}${start?.localTime ? ` • ${start.localTime.slice(0, 5)}` : ""}`,
    venue: venue?.name ?? "Local não informado",
    city: venue?.city?.name ?? "",
    price: priceRange?.min ?? 0,
    maxPrice: priceRange?.max,
    currency: priceRange?.currency,
    priceSource: event.priceSource,
    category,
    image: image?.url ?? "https://placehold.co/640x360?text=Viva%C3%AA",
    sourceDate: start?.localDate,
    description,
    note: event.pleaseNote,
  };
}
