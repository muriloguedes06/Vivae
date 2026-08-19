import { useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { EventCard } from "../components/EventCard";
import { Icon } from "../components/Icon";
import { ticketTypes } from "../data/mockData";
import { formatCurrency } from "../utils/formatters";
import { useTicketmasterEvents } from "../hooks/useTicketmasterEvents";
import { ticketmasterToEventItem } from "../utils/ticketmaster";
import { useTicketmasterEvent } from "../hooks/useTicketmasterEvent";
import { savePurchaseDraft } from "../utils/purchaseDraft";

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [draftFilters, setDraftFilters] = useState({
    category: "Todos",
    minPrice: "",
    maxPrice: "",
    date: "",
    city: "",
  });
  const [filters, setFilters] = useState(draftFilters);
  const {
    events: ticketmasterEvents,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
  } = useTicketmasterEvents(initialQuery);
  const apiEvents = useMemo(
    () => ticketmasterEvents.map(ticketmasterToEventItem),
    [ticketmasterEvents],
  );
  const visible = useMemo(
    () =>
      apiEvents.filter(
        (event) => {
          const minPrice = Number(filters.minPrice || 0);
          const maxPrice = Number(filters.maxPrice || Infinity);
          const hasPriceFilter = Boolean(filters.minPrice || filters.maxPrice);
          const eventMaxPrice = event.maxPrice ?? event.price;
          const categoryMatches =
            filters.category === "Todos" ||
            event.category === filters.category;
          const priceMatches =
            !hasPriceFilter ||
            (event.price > 0 &&
              eventMaxPrice >= minPrice &&
              event.price <= maxPrice);

          return (
            categoryMatches &&
            priceMatches &&
            (!filters.date || event.sourceDate === filters.date) &&
            (!filters.city || event.city === filters.city) &&
            event.title.toLowerCase().includes(query.toLowerCase())
          );
        },
      ),
    [apiEvents, filters, query],
  );
  const cities = useMemo(
    () =>
      [...new Set(apiEvents.map((event) => event.city).filter(Boolean))].sort(),
    [apiEvents],
  );

  function handleSearch(value: string) {
    setQuery(value);
    setSearchParams(value ? { query: value } : {});
  }

  return (
    <>
      <AppHeader onSearch={handleSearch} />
      <main className="page">
        <section className="page-title">
          <h1>Encontre seu próximo evento</h1>
          <p>Shows, filmes e experiências disponíveis.</p>
        </section>
        <div className="catalog-layout">
          <form
            className="filters"
            onSubmit={(event) => {
              event.preventDefault();
              setFilters(draftFilters);
            }}
          >
            <h3>Filtros</h3>
            <hr />
            <b>Tipo</b>
            {["Todos", "Show", "Filme", "Festival"].map((item) => (
              <label key={item}>
                <input
                  type="radio"
                  name="category"
                  checked={draftFilters.category === item}
                  onChange={() =>
                    setDraftFilters((current) => ({ ...current, category: item }))
                  }
                />
                {item}
              </label>
            ))}
            <b>Faixa de Preço</b>
            <div className="price-range">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="R$ 0"
                value={draftFilters.minPrice}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    minPrice: event.target.value,
                  }))
                }
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="R$ 500"
                value={draftFilters.maxPrice}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    maxPrice: event.target.value,
                  }))
                }
              />
            </div>
            <small className="filter-hint">
              O filtro considera somente eventos com preço informado pela
              Ticketmaster.
            </small>
            <b>Data</b>
            <input
              type="date"
              value={draftFilters.date}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
            />
            <b>Cidade</b>
            <select
              value={draftFilters.city}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
            >
              <option value="">Todas as cidades</option>
              {cities.map((city) => <option key={city}>{city}</option>)}
            </select>
            <button className="button primary" type="submit">Aplicar filtros</button>
          </form>
          <section className="catalog">
            <form
              className="mobile-search"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch(query.trim());
              }}
            >
              <Icon>search</Icon>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar eventos"
              />
              <button className="button primary" disabled={loading}>
                Buscar
              </button>
            </form>
            <div className="tabs">
              {["Todos", "Show", "Filme", "Festival"].map((item) => (
                <button
                  className={filters.category === item ? "active" : ""}
                  onClick={() => {
                    setDraftFilters((current) => ({ ...current, category: item }));
                    setFilters((current) => ({ ...current, category: item }));
                  }}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            {loading && <p className="catalog-message">Carregando eventos...</p>}
            {error && <p className="error-banner">{error}</p>}
            {!loading && !error && visible.length === 0 && (
              <p className="catalog-message">Nenhum evento encontrado.</p>
            )}
            <div className="event-grid">
              {visible.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </div>
            {hasMore && !loading && (
              <div className="load-more">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Carregando..." : "Mostrar mais"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export function EventDetailsPage() {
  const { id } = useParams();
  const { event: ticketmasterEvent, loading, error } = useTicketmasterEvent(id);
  const event = ticketmasterEvent
    ? ticketmasterToEventItem(ticketmasterEvent)
    : undefined;

  if (loading) {
    return <main className="center-page">Carregando evento...</main>;
  }

  if (error || !event) {
    return (
      <main className="center-page">
        <div className="error-banner">{error || "Evento não encontrado."}</div>
        <Link className="button primary" to="/eventos">Voltar aos eventos</Link>
      </main>
    );
  }
  return (
    <>
      <AppHeader />
      <main className="page detail-page">
        <Link className="back" to="/eventos">
          <Icon>arrow_back</Icon>Voltar para eventos
        </Link>
        <section className="event-hero">
          <img src={event.image} alt={event.title} />
          <div>
            <span>{event.category}</span>
            <h1>{event.title}</h1>
            <p>
              <Icon>calendar_today</Icon>
              {event.date}
            </p>
            <p>
              <Icon>location_on</Icon>
              {event.venue}, {event.city}
            </p>
          </div>
        </section>
        <div className="detail-columns">
          <article>
            <h2>Descrição do Evento</h2>
            <p>
              {event.description ??
                "A Ticketmaster não forneceu uma descrição para este evento."}
            </p>
            {event.note && (
              <div className="event-note">
                <Icon>info</Icon>
                <span>
                  <b>Informações importantes</b>
                  {event.note}
                </span>
              </div>
            )}
          </article>
          <aside className="purchase-card">
            <h2>Ingressos</h2>
            <p>A partir de</p>
            <strong>
              {event.price > 0
                ? event.maxPrice && event.maxPrice !== event.price
                  ? `${formatCurrency(event.price, event.currency)} – ${formatCurrency(event.maxPrice, event.currency)}`
                  : formatCurrency(event.price, event.currency)
                : "Consulte"}
            </strong>
            <Link
              className="button primary wide"
              to={`/ingressos?eventId=${encodeURIComponent(event.id)}`}
            >
              Comprar ingressos
            </Link>
            <small>
              <Icon>verified_user</Icon>Compra segura e protegida
            </small>
          </aside>
        </div>
      </main>
    </>
  );
}

export function TicketSelectionPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") ?? undefined;
  const { event: ticketmasterEvent, loading, error } =
    useTicketmasterEvent(eventId);
  const selectedEvent = ticketmasterEvent
    ? ticketmasterToEventItem(ticketmasterEvent)
    : undefined;
  const [quantities, setQuantities] = useState<Record<string, number>>({
    pista: 1,
  });
  const total = ticketTypes.reduce(
    (sum, type) => sum + type.price * (quantities[type.id] ?? 0),
    0,
  );
  const update = (id: string, value: number) =>
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, Math.min(6, (current[id] ?? 0) + value)),
    }));

  if (!eventId) {
    return <Navigate to="/eventos" replace />;
  }

  if (loading) {
    return <main className="center-page">Carregando ingressos...</main>;
  }

  if (error || !selectedEvent) {
    return (
      <main className="center-page">
        <div className="error-banner">{error || "Evento não encontrado."}</div>
        <Link className="button primary" to="/eventos">Voltar aos eventos</Link>
      </main>
    );
  }

  const lines = ticketTypes
    .map((type) => ({
      ticketTypeId: type.id,
      name: type.name,
      quantity: quantities[type.id] ?? 0,
      unitPrice: type.price,
    }))
    .filter((line) => line.quantity > 0);

  return (
    <>
      <AppHeader />
      <main className="page narrow">
        <Link className="back" to={`/eventos/${selectedEvent.id}`}>
          <Icon>arrow_back</Icon>Voltar
        </Link>
        <header className="selection-title">
          <img src={selectedEvent.image} alt={selectedEvent.title} />
          <div>
            <small>{selectedEvent.date}</small>
            <h1>{selectedEvent.title}</h1>
            <p>{selectedEvent.venue}, {selectedEvent.city}</p>
          </div>
        </header>
        <h2>Ingressos Disponíveis</h2>
        <div className="ticket-types">
          {ticketTypes.map((type) => (
            <article key={type.id}>
              <div>
                <h3>{type.name}</h3>
                <p>{type.description}</p>
                <small>{type.available} disponíveis</small>
              </div>
              <strong>{formatCurrency(type.price)}</strong>
              <div className="stepper">
                <button onClick={() => update(type.id, -1)}>-</button>
                <b>{quantities[type.id] ?? 0}</b>
                <button onClick={() => update(type.id, 1)}>+</button>
              </div>
            </article>
          ))}
        </div>
        <aside className="order-bar">
          <span>
            <small>Resumo do Pedido</small>
            <b>
              {Object.values(quantities).reduce((a, b) => a + b, 0)} ingressos
            </b>
          </span>
          <strong>{formatCurrency(total)}</strong>
          <Link
            className={`button primary ${total ? "" : "disabled"}`}
            to={`/checkout?eventId=${encodeURIComponent(selectedEvent.id)}`}
            onClick={() =>
              savePurchaseDraft({ event: selectedEvent, lines, total })
            }
          >
            Continuar
          </Link>
        </aside>
      </main>
    </>
  );
}
