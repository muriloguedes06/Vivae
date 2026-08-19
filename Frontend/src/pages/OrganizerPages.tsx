import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { OrganizerSidebar } from "../components/OrganizerSidebar";
import { useTicketmasterEvents } from "../hooks/useTicketmasterEvents";
import { useTicketmasterEvent } from "../hooks/useTicketmasterEvent";
import { useTmdbMovie, useTmdbMovies } from "../hooks/useTmdbMovies";
import { useOrganizerEvent, useOrganizerEvents } from "../hooks/useLocalEvents";
import { formatCurrency } from "../utils/formatters";
import { createLocalEvent, deleteLocalEvent, updateLocalEvent } from "../api/api";
import { ticketmasterCategory } from "../utils/localEvents";
import type { CreateLocalEventInput } from "../types";

export function OrganizerDashboardPage() {
  const { events, loading, error } = useOrganizerEvents();
  const totalSold = events.reduce((total, event) => total + event.sold, 0);
  const totalCapacity = events.reduce(
    (total, event) => total + event.capacity,
    0,
  );
  const estimatedRevenue = events.reduce(
    (total, event) => total + event.ticketTypes.reduce(
      (subtotal, type) => subtotal + type.sold * type.price, 0),
    0,
  );
  const published = events.filter(
    (event) => event.status === "PUBLISHED",
  ).length;

  return (
    <main className="organizer-layout">
      <OrganizerSidebar />
      <section className="organizer-main dashboard">
        <header>
          <div>
            <small>VISÃO GERAL</small>
            <h1>Dashboard</h1>
            <p>Acompanhe o desempenho dos seus eventos em um só lugar.</p>
          </div>
          <Link className="button primary" to="/organizador/catalogo">
            <Icon>add</Icon>Novo evento
          </Link>
        </header>

        <section className="dashboard-metrics">
          <article>
            <span><Icon>event</Icon>Eventos publicados</span>
            <strong>{published}</strong>
            <small>{events.length} eventos no total</small>
          </article>
          <article>
            <span><Icon>confirmation_number</Icon>Ingressos vendidos</span>
            <strong>{totalSold.toLocaleString("pt-BR")}</strong>
            <small>{totalCapacity ? Math.round((totalSold / totalCapacity) * 100) : 0}% da capacidade</small>
          </article>
          <article>
            <span><Icon>payments</Icon>Receita estimada</span>
            <strong>{formatCurrency(estimatedRevenue)}</strong>
            <small>Com base nas vendas registradas</small>
          </article>
          <article>
            <span><Icon>groups</Icon>Capacidade total</span>
            <strong>{totalCapacity.toLocaleString("pt-BR")}</strong>
            <small>{(totalCapacity - totalSold).toLocaleString("pt-BR")} lugares livres</small>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel">
            <header>
              <div>
                <h2>Desempenho dos eventos</h2>
                <p>Ocupação atual por evento</p>
              </div>
              <Link to="/organizador/eventos">Ver todos</Link>
            </header>
            <div className="event-performance">
              {loading && <p>Carregando...</p>}
              {error && <p className="error-banner">{error}</p>}
              {events.map((event) => {
                const percentage = event.capacity ? Math.round((event.sold / event.capacity) * 100) : 0;
                return (
                  <div key={event.id}>
                    <span><b>{event.title}</b><small>{percentage}%</small></span>
                    <div><i style={{ width: `${percentage}%` }} /></div>
                    <small>{event.sold.toLocaleString("pt-BR")} de {event.capacity.toLocaleString("pt-BR")} ingressos</small>
                  </div>
                );
              })}
            </div>
          </article>

          <aside className="dashboard-panel quick-actions">
            <h2>Ações rápidas</h2>
            <Link to="/organizador/catalogo"><Icon>travel_explore</Icon><span><b>Explorar catálogo</b><small>Importar da Ticketmaster</small></span></Link>
            <Link to="/organizador/eventos"><Icon>edit_calendar</Icon><span><b>Gerenciar eventos</b><small>Editar e publicar</small></span></Link>
            <Link to="/portaria"><Icon>qr_code_scanner</Icon><span><b>Abrir portaria</b><small>Validar ingressos</small></span></Link>
          </aside>
        </section>
      </section>
    </main>
  );
}

export function OrganizerEventsPage() {
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");
  const { events, loading, error } = useOrganizerEvents();
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const statusByFilter: Record<string, string> = { Publicados: "PUBLISHED", Rascunhos: "DRAFT" };
  const visible = events.filter((event) => !removedIds.includes(event.id) &&
    (filter === "Todos" || event.status === statusByFilter[filter]) &&
    event.title.toLowerCase().includes(query.toLowerCase()),
  );
  const statusLabel: Record<string, string> = {
    PUBLISHED: "Publicado", DRAFT: "Rascunho", CANCELLED: "Cancelado", FINISHED: "Encerrado",
  };

  async function removeEvent(id: string, title: string) {
    if (!window.confirm(`Excluir o evento “${title}”? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteLocalEvent(id);
      setRemovedIds((current) => [...current, id]);
    } catch {
      window.alert("Não foi possível excluir. Eventos com vendas ou ingressos devem ser preservados.");
    }
  }
  return (
    <main className="organizer-layout">
      <OrganizerSidebar />
      <section className="organizer-main">
        <header>
          <div>
            <h1>Meus eventos</h1>
            <p>Gerencie, edite e acompanhe o status dos seus eventos.</p>
          </div>
          <Link className="button primary" to="/organizador/catalogo">
            <Icon>add</Icon>Criar evento
          </Link>
        </header>
        <div className="organizer-toolbar">
          <label>
            <Icon>search</Icon>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar eventos..." />
          </label>
          <div className="tabs">
            {["Todos", "Publicados", "Rascunhos"].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="event-table">
          <div className="table-head">
            <span>Evento</span>
            <span>Data</span>
            <span>Local</span>
            <span>Capacidade</span>
            <span>Preço</span>
            <span>Status</span>
            <span>Ações</span>
          </div>
          {loading && <p>Carregando seus eventos...</p>}
          {error && <p className="error-banner">{error}</p>}
          {visible.map((event) => (
            <div className="table-row" key={event.id}>
              <span className="table-event">
                <img src={event.coverUrl ?? "https://placehold.co/160x90?text=Vivaê"} alt="" />
                <b>
                  {event.title}
                  <small>ID: #{event.id}</small>
                </b>
              </span>
              <span>{new Date(event.startsAt).toLocaleString("pt-BR")}</span>
              <span>{event.venueName}</span>
              <span>
                {event.sold.toLocaleString()} /{" "}
                {event.capacity.toLocaleString()}
              </span>
              <span>{formatCurrency(event.minPrice)}</span>
              <span>
                <i className={`status ${statusLabel[event.status].toLowerCase()}`}>
                  {statusLabel[event.status]}
                </i>
              </span>
              <span>
                <span className="table-actions">
                  <Link to={`/organizador/configurar?eventId=${event.id}`} aria-label="Editar evento">
                    <Icon>edit</Icon>
                  </Link>
                  <button onClick={() => void removeEvent(event.id, event.title)} aria-label="Excluir evento">
                    <Icon>delete</Icon>
                  </button>
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export function EventCatalogPage() {
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<"events" | "movies">("events");
  const { events: catalogEvents, loading: loadingEvents, error: eventsError, search: searchEvents } =
    useTicketmasterEvents();
  const { movies, loading: loadingMovies, error: moviesError, search: searchMovies } =
    useTmdbMovies();
  const loading = catalog === "events" ? loadingEvents : loadingMovies;
  const error = catalog === "events" ? eventsError : moviesError;

  return (
    <main className="organizer-layout">
      <OrganizerSidebar />
      <section className="organizer-main">
        <header>
          <div>
            <h1>Criar Evento</h1>
            <p>Escolha um evento do catálogo para começar.</p>
          </div>
        </header>
        <div className="tabs catalog-source-tabs">
          <button className={catalog === "events" ? "active" : ""} onClick={() => { setCatalog("events"); setQuery(""); }}>
            Eventos · Ticketmaster
          </button>
          <button className={catalog === "movies" ? "active" : ""} onClick={() => { setCatalog("movies"); setQuery(""); }}>
            Filmes · TMDb
          </button>
        </div>
        <form
          className="catalog-search"
          onSubmit={(event) => {
            event.preventDefault();
            if (catalog === "events") void searchEvents(query.trim());
            else void searchMovies(query.trim());
          }}
        >
          <Icon>search</Icon>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={catalog === "events" ? "Buscar na Ticketmaster" : "Buscar filmes na TMDb"}
          />
          <button className="button primary" type="submit" disabled={loading}>
            Buscar
          </button>
        </form>
        {loading && <p>Carregando eventos...</p>}
        {error && <p className="error-banner">{error}</p>}
        {!loading && !error && (catalog === "events" ? catalogEvents.length === 0 : movies.length === 0) && (
          <p>Nenhum evento encontrado.</p>
        )}
        <div className="catalog-options">
          {catalog === "events" && catalogEvents.map((event) => {
            const venue = event._embedded?.venues?.[0];
            const image =
              event.images?.find(
                (item) => item.ratio === "16_9" && !item.fallback,
              ) ?? event.images?.[0];
            const classification = event.classifications?.[0];

            return (
            <article key={event.id}>
              {image && <img src={image.url} alt={event.name} />}
              <div>
                <small>
                  {classification?.segment?.name ?? "Evento"}
                  {classification?.genre?.name
                    ? ` • ${classification.genre.name}`
                    : ""}
                </small>
                <h2>{event.name}</h2>
                <p>
                  {event.dates?.start?.localDate ?? "Data não informada"}
                  {venue?.name ? ` • ${venue.name}` : ""}
                  {venue?.city?.name ? `, ${venue.city.name}` : ""}
                </p>
                <Link className="button primary" to={`/organizador/configurar?externalId=${encodeURIComponent(event.id)}`}>
                  Selecionar evento
                </Link>
              </div>
            </article>
            );
          })}
          {catalog === "movies" && movies.map((movie) => (
            <article key={movie.id}>
              {movie.backdropUrl || movie.posterUrl ? (
                <img src={movie.backdropUrl ?? movie.posterUrl ?? ""} alt={movie.title} />
              ) : null}
              <div>
                <small>Filme · TMDb · Nota {movie.vote_average.toFixed(1)}</small>
                <h2>{movie.title}</h2>
                <p>{movie.release_date || "Lançamento não informado"}</p>
                <Link className="button primary" to={`/organizador/configurar?movieId=${movie.id}`}>
                  Selecionar filme
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function ConfigureEventPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const externalId = searchParams.get("externalId") ?? undefined;
  const movieId = searchParams.get("movieId") ?? undefined;
  const eventId = searchParams.get("eventId") ?? undefined;
  const { event: catalogEvent, loading: loadingCatalog, error: catalogError } =
    useTicketmasterEvent(externalId);
  const { event: localEvent, loading: loadingLocal, error: localError } =
    useOrganizerEvent(eventId);
  const { movie, loading: loadingMovie, error: movieError } = useTmdbMovie(movieId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [capacities, setCapacities] = useState([1000, 500, 100]);
  const [prices, setPrices] = useState([0, 0, 0]);
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(8);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const total = useMemo(
    () => capacities.reduce((sum, value) => sum + value, 0),
    [capacities],
  );

  useEffect(() => {
    async function initializeForm() {
      if (localEvent) {
        const startsAt = new Date(localEvent.startsAt);
        setDate(startsAt.toISOString().slice(0, 10));
        setTime(startsAt.toTimeString().slice(0, 5));
        setVenueName(localEvent.venueName);
        setAddress(localEvent.address);
        setCity(localEvent.city);
        setState(localEvent.state);
        setCapacities([0, 0, 0].map((_, index) => localEvent.ticketTypes[index]?.capacity ?? 0));
        setPrices([0, 0, 0].map((_, index) => localEvent.ticketTypes[index]?.price ?? 0));
        setTitle(localEvent.title);
        setDescription(localEvent.description);
        if (localEvent.ticketingMode === "RESERVED_SEATING" && localEvent.seats.length) {
          setRows(new Set(localEvent.seats.map((seat) => seat.row)).size);
          setColumns(Math.max(...localEvent.seats.map((seat) => seat.number)));
        }
        return;
      }
      if (movie) {
        setTitle(movie.title);
        setDescription(movie.overview || "Filme selecionado no catálogo da TMDb.");
        setCapacities([40, 0, 0]);
        setPrices([0, 0, 0]);
        return;
      }
      if (!catalogEvent) return;
      const venue = catalogEvent._embedded?.venues?.[0];
      const referencePrice = catalogEvent.priceRanges?.[0]?.min ?? 0;
      setDate(catalogEvent.dates?.start?.localDate ?? "");
      setTime(catalogEvent.dates?.start?.localTime?.slice(0, 5) ?? "");
      setVenueName(venue?.name ?? "");
      setAddress(venue?.address?.line1 ?? "");
      setCity(venue?.city?.name ?? "");
      setState(venue?.state?.stateCode ?? venue?.state?.name ?? "");
      setPrices([referencePrice, referencePrice, referencePrice]);
      setTitle(catalogEvent.name);
      setDescription(catalogEvent.description ?? catalogEvent.info
        ?? catalogEvent.additionalInfo ?? "Evento configurado pelo organizador no Vivaê.");
    }
    void initializeForm();
  }, [catalogEvent, localEvent, movie]);

  const isMovie = Boolean(movie) || localEvent?.ticketingMode === "RESERVED_SEATING";

  async function saveAndPublish() {
    if ((!catalogEvent && !localEvent && !movie) || !title.trim() || !description.trim() || !date || !time) {
      setSubmitError("Selecione um evento e informe data e horário.");
      return;
    }
    const validTicketTypes = (isMovie ? ["Inteira", "", ""] : ["Pista", "Premium", "VIP"])
      .map((name, index) => ({
        name,
        price: prices[index],
        capacity: capacities[index],
      }))
      .filter((type) => type.price > 0 && type.capacity > 0);
    if (!venueName || !address || !city || !state || validTicketTypes.length === 0) {
      setSubmitError("Preencha o local e ao menos um ingresso com preço e capacidade.");
      return;
    }

    const classification = catalogEvent?.classifications?.[0];
    const image = catalogEvent?.images?.find((item) => item.ratio === "16_9" && !item.fallback)
      ?? catalogEvent?.images?.[0];
    const payload: CreateLocalEventInput = {
      externalSource: localEvent?.externalSource ?? (movie ? "TMDB" : "TICKETMASTER"),
      externalId: localEvent?.externalId ?? catalogEvent?.id ?? String(movie?.id),
      title: title.trim(),
      description: description.trim(),
      category: localEvent?.category ?? (movie ? "MOVIE" : ticketmasterCategory(
        classification?.segment?.name, classification?.genre?.name)),
      ticketingMode: isMovie ? "RESERVED_SEATING" : "GENERAL_ADMISSION",
      coverUrl: localEvent?.coverUrl ?? image?.url ?? movie?.backdropUrl ?? movie?.posterUrl ?? undefined,
      venueName,
      address,
      city,
      state,
      startsAt: new Date(`${date}T${time}`).toISOString(),
      publish: true,
      seatMap: isMovie ? { rows, columns } : undefined,
      ticketTypes: validTicketTypes,
    };

    setSaving(true);
    setSubmitError("");
    try {
      if (eventId) await updateLocalEvent(eventId, payload);
      else await createLocalEvent(payload);
      navigate("/organizador/eventos");
    } catch {
      setSubmitError("Não foi possível criar o evento. Confira os dados ou se ele já foi importado.");
    } finally {
      setSaving(false);
    }
  }

  if (!externalId && !movieId && !eventId) {
    return <main className="center-page">Selecione um item no catálogo da Ticketmaster.</main>;
  }
  if (loadingCatalog || loadingMovie || loadingLocal) return <main className="center-page">Carregando evento...</main>;
  if (catalogError || movieError || localError || (!catalogEvent && !movie && !localEvent)) {
    return <main className="center-page"><p className="error-banner">{catalogError || movieError || localError}</p></main>;
  }

  return (
    <main className="organizer-layout">
      <OrganizerSidebar />
      <section className="organizer-main configure">
        <header>
          <div>
            <h1>Configuração do Evento</h1>
            <p>{localEvent?.title ?? catalogEvent?.name ?? movie?.title}</p>
          </div>
          <button className="button primary" onClick={() => void saveAndPublish()} disabled={saving}>
            {saving ? "Salvando..." : eventId ? "Salvar alterações" : "Salvar e publicar"}
          </button>
        </header>
        <section className="config-card">
          <h2>Informações do Evento</h2>
          <div className="form-grid">
            <label className="full">
              Título
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="full">
              Descrição
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
            </label>
          </div>
        </section>
        <section className="config-card">
          <h2>Quando e Onde</h2>
          <div className="form-grid">
            <label>
              Data
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label>
              Horário
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
            <label className="full">
              Nome do local
              <input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Allianz Parque" />
            </label>
            <label className="full">
              Endereço
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Avenida Principal, 100" />
            </label>
            <label>
              Cidade
              <input value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
            <label>
              Estado
              <input value={state} onChange={(e) => setState(e.target.value)} maxLength={2} />
            </label>
          </div>
        </section>
        <section className="config-card">
          <h2>Modelo de Ingressos</h2>
          <div>
              <h3>{isMovie ? "Sala com assentos marcados" : "Venda por quantidade"}</h3>
              {(isMovie ? ["Inteira"] : ["Pista", "Premium", "VIP"]).map((name, index) => (
                <div className="capacity-row" key={name}>
                  <b>{name}</b>
                  <label>
                    Capacidade
                    <input
                      type="number"
                      value={capacities[index]}
                      disabled={isMovie}
                      onChange={(e) =>
                        setCapacities((old) =>
                          old.map((v, i) =>
                            i === index ? Number(e.target.value) : v,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Preço
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prices[index]}
                      onChange={(e) => setPrices((old) => old.map((value, i) =>
                        i === index ? Number(e.target.value) : value))}
                    />
                  </label>
                </div>
              ))}
              {isMovie && (
                <div className="two-columns">
                  <label>
                    Fileiras
                    <input type="number" min="1" max="26" value={rows} onChange={(e) => {
                      const value = Number(e.target.value);
                      setRows(value);
                      setCapacities([value * columns, 0, 0]);
                    }} />
                  </label>
                  <label>
                    Assentos por fileira
                    <input type="number" min="1" max="50" value={columns} onChange={(e) => {
                      const value = Number(e.target.value);
                      setColumns(value);
                      setCapacities([rows * value, 0, 0]);
                    }} />
                  </label>
                </div>
              )}
              <p className="capacity-total">
                Capacidade total <b>{total.toLocaleString("pt-BR")}</b>
              </p>
          </div>
          {submitError && <p className="error-banner">{submitError}</p>}
        </section>
      </section>
    </main>
  );
}
