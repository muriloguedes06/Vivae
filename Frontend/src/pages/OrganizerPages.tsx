import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { OrganizerSidebar } from "../components/OrganizerSidebar";
import { SeatMap } from "../components/SeatMap";
import { organizerEvents } from "../data/mockData";
import { useTicketmasterEvents } from "../hooks/useTicketmasterEvents";
import { formatCurrency } from "../utils/formatters";

export function OrganizerDashboardPage() {
  const totalSold = organizerEvents.reduce((total, event) => total + event.sold, 0);
  const totalCapacity = organizerEvents.reduce(
    (total, event) => total + event.capacity,
    0,
  );
  const estimatedRevenue = organizerEvents.reduce(
    (total, event) => total + event.sold * event.price,
    0,
  );
  const published = organizerEvents.filter(
    (event) => event.status === "Publicado",
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
            <small>{organizerEvents.length} eventos no total</small>
          </article>
          <article>
            <span><Icon>confirmation_number</Icon>Ingressos vendidos</span>
            <strong>{totalSold.toLocaleString("pt-BR")}</strong>
            <small>{Math.round((totalSold / totalCapacity) * 100)}% da capacidade</small>
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
              {organizerEvents.map((event) => {
                const percentage = Math.round((event.sold / event.capacity) * 100);
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
  const visible = organizerEvents.filter(
    (event) => filter === "Todos" || event.status === filter.slice(0, -1),
  );
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
            <input placeholder="Buscar eventos..." />
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
          {visible.map((event) => (
            <div className="table-row" key={event.id}>
              <span className="table-event">
                <img src={event.image} alt="" />
                <b>
                  {event.title}
                  <small>ID: #{event.id}</small>
                </b>
              </span>
              <span>{event.date}</span>
              <span>{event.venue}</span>
              <span>
                {event.sold.toLocaleString()} /{" "}
                {event.capacity.toLocaleString()}
              </span>
              <span>R$ {event.price}</span>
              <span>
                <i className={`status ${event.status.toLowerCase()}`}>
                  {event.status}
                </i>
              </span>
              <span>
                <Link to="/organizador/configurar">
                  <Icon>edit</Icon>
                </Link>
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
  const { events: catalogEvents, loading, error, search } =
    useTicketmasterEvents();

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
        <form
          className="catalog-search"
          onSubmit={(event) => {
            event.preventDefault();
            void search(query.trim());
          }}
        >
          <Icon>search</Icon>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar na Ticketmaster"
          />
          <button className="button primary" type="submit" disabled={loading}>
            Buscar
          </button>
        </form>
        {loading && <p>Carregando eventos...</p>}
        {error && <p className="error-banner">{error}</p>}
        {!loading && !error && catalogEvents.length === 0 && (
          <p>Nenhum evento encontrado.</p>
        )}
        <div className="catalog-options">
          {catalogEvents.map((event) => {
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
                <Link className="button primary" to="/organizador/configurar">
                  Selecionar evento
                </Link>
              </div>
            </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export function ConfigureEventPage() {
  const [model, setModel] = useState<"quantity" | "seatmap">("quantity");
  const [capacities, setCapacities] = useState([1000, 500, 100]);
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(8);
  const total = useMemo(
    () => capacities.reduce((sum, value) => sum + value, 0),
    [capacities],
  );
  return (
    <main className="organizer-layout">
      <OrganizerSidebar />
      <section className="organizer-main configure">
        <header>
          <div>
            <h1>Configuração do Evento</h1>
            <p>Coldplay - Music Of The Spheres</p>
          </div>
          <button className="button primary">Salvar e publicar</button>
        </header>
        <section className="config-card">
          <h2>Quando e Onde</h2>
          <div className="form-grid">
            <label>
              Data
              <input type="date" />
            </label>
            <label>
              Horário
              <input type="time" />
            </label>
            <label className="full">
              Local
              <input placeholder="Allianz Parque, São Paulo" />
            </label>
          </div>
        </section>
        <section className="config-card">
          <h2>Modelo de Ingressos</h2>
          <div className="model-options">
            <button
              className={model === "quantity" ? "active" : ""}
              onClick={() => setModel("quantity")}
            >
              <Icon>confirmation_number</Icon>
              <b>Quantidade / Pista</b>
              <small>Venda por setores e lotes</small>
            </button>
            <button
              className={model === "seatmap" ? "active" : ""}
              onClick={() => setModel("seatmap")}
            >
              <Icon>event_seat</Icon>
              <b>Mapa de Assentos</b>
              <small>Escolha individual de lugares</small>
            </button>
          </div>
          {model === "quantity" ? (
            <div>
              <h3>Setores e Lotes</h3>
              {["Pista", "Premium", "VIP"].map((name, index) => (
                <div className="capacity-row" key={name}>
                  <b>{name}</b>
                  <label>
                    Capacidade
                    <input
                      type="number"
                      value={capacities[index]}
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
                    <input placeholder="R$ 0,00" />
                  </label>
                </div>
              ))}
              <p className="capacity-total">
                Capacidade total <b>{total.toLocaleString("pt-BR")}</b>
              </p>
            </div>
          ) : (
            <div>
              <h3>Configuração Rápida de Grid</h3>
              <div className="two-columns">
                <label>
                  Fileiras
                  <input
                    type="number"
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                  />
                </label>
                <label>
                  Assentos por fileira
                  <input
                    type="number"
                    value={columns}
                    onChange={(e) => setColumns(Number(e.target.value))}
                  />
                </label>
              </div>
              <SeatMap compact rows={rows} columns={columns} />
              <p className="capacity-total">
                Capacidade total <b>{rows * columns}</b>
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
