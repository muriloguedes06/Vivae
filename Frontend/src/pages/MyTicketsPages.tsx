import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { AppHeader } from "../components/AppHeader";
import { Icon } from "../components/Icon";
import { images } from "../data/mockData";
import { useMyTicket, useMyTickets } from "../hooks/useMyTickets";
import type { MyTicket, TicketStatus } from "../types";
import { getSharedTicket } from "../api/api";

type TicketFilter = "ALL" | TicketStatus;

const statusLabels: Record<TicketStatus, string> = {
  ACTIVE: "Ativo",
  USED: "Utilizado",
  CANCELLED: "Cancelado",
};

function formatTicketDate(value?: string) {
  if (!value) return "Data a definir";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getVenue(ticket: MyTicket) {
  return `${ticket.event.venueName}, ${ticket.event.city} - ${ticket.event.state}`;
}

export function MyTicketsPage() {
  const { tickets, loading, error } = useMyTickets();
  const [filter, setFilter] = useState<TicketFilter>("ALL");
  const visibleTickets = useMemo(
    () =>
      filter === "ALL"
        ? tickets
        : tickets.filter((ticket) => ticket.status === filter),
    [filter, tickets],
  );

  return (
    <>
      <AppHeader />
      <main className="page">
        <section className="page-title">
          <h1>Meus ingressos</h1>
          <p>Aqui aparecem somente os ingressos emitidos para a sua conta.</p>
        </section>

        <div className="tabs" aria-label="Filtrar ingressos">
          {([
            ["ALL", "Todos"],
            ["ACTIVE", "Ativos"],
            ["USED", "Utilizados"],
            ["CANCELLED", "Cancelados"],
          ] as Array<[TicketFilter, string]>).map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="ticket-state">Carregando seus ingressos...</p>}
        {error && <p className="ticket-state error">{error}</p>}
        {!loading && !error && visibleTickets.length === 0 && (
          <section className="ticket-state">
            <Icon>confirmation_number</Icon>
            <h2>Nenhum ingresso encontrado</h2>
            <p>
              Um ingresso aparecerá aqui depois que um pagamento aprovado gerar
              um registro na tabela Ticket para o seu usuário.
            </p>
            <Link className="button primary" to="/eventos">
              Explorar eventos
            </Link>
          </section>
        )}

        <div className="my-tickets">
          {visibleTickets.map((ticket) => {
            return (
              <article key={ticket.id}>
                <img
                  src={ticket.event.coverUrl ?? images.ticket}
                  alt={ticket.event.title}
                />
                <div>
                  <small>{formatTicketDate(ticket.event.startsAt)}</small>
                  <h2>{ticket.event.title}</h2>
                  <p>
                    <Icon>location_on</Icon>
                    {getVenue(ticket)}
                  </p>
                  <span>
                    {ticket.ticketType.name} · {statusLabels[ticket.status]}
                  </span>
                </div>
                <Link
                  className="button primary"
                  to={`/ingresso-digital?ticketId=${encodeURIComponent(ticket.id)}`}
                >
                  Ver ingresso
                </Link>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}

export function DigitalTicketPage() {
  const [searchParams] = useSearchParams();
  const { ticket, loading, error } = useMyTicket(searchParams.get("ticketId"));
  const [shareMessage, setShareMessage] = useState("");

  async function shareTicket() {
    if (!ticket?.shareToken) return;

    const url = `${window.location.origin}/ingresso-compartilhado/${ticket.shareToken}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: ticket.event.title,
          text: `Ingresso ${ticket.code}`,
          url,
        });
        return;
      } catch {
        return;
      }
    }

    await navigator.clipboard.writeText(url);
    setShareMessage("Link copiado.");
  }

  if (loading) {
    return <main className="ticket-page ticket-state">Carregando ingresso...</main>;
  }

  if (error || !ticket) {
    return (
      <main className="ticket-page ticket-state">
        <h1>Ingresso indisponível</h1>
        <p>{error}</p>
        <Link className="button primary" to="/meus-ingressos">
          Voltar aos meus ingressos
        </Link>
      </main>
    );
  }

  return (
    <main className="ticket-page">
      <header>
        <Link to="/meus-ingressos" aria-label="Voltar">
          <Icon>arrow_back</Icon>
        </Link>
        <b>Seu ingresso</b>
        <button onClick={() => void shareTicket()} aria-label="Compartilhar">
          <Icon>ios_share</Icon>
        </button>
      </header>
      {shareMessage && <p className="ticket-hint">{shareMessage}</p>}
      <section className="digital-ticket">
        <img
          src={ticket.event.coverUrl ?? images.ticket}
          alt={ticket.event.title}
        />
        <div className="ticket-info">
          <small>{ticket.event.category}</small>
          <h1>{ticket.event.title}</h1>
          <p>
            <Icon>calendar_today</Icon>
            {formatTicketDate(ticket.event.startsAt)}
          </p>
          <p>
            <Icon>location_on</Icon>
            {getVenue(ticket)}
          </p>
        </div>
        <div className="qr-placeholder">
          <QRCodeSVG value={ticket.qrToken ?? ticket.code} size={190} level="M" />
          <strong>{ticket.code}</strong>
          <p>Apresente este QR Code ou informe o código na portaria.</p>
        </div>
        <div className="ticket-meta">
          <span>
            <small>PARTICIPANTE</small>
            <b>{ticket.holderName}</b>
          </span>
          <span>
            <small>INGRESSO</small>
            <b>{ticket.ticketType.name}</b>
          </span>
          <span>
            <small>PEDIDO</small>
            <b>{ticket.order.code}</b>
          </span>
          {ticket.seat && (
            <span>
              <small>ASSENTO</small>
              <b>{ticket.seat.label}</b>
            </span>
          )}
        </div>
      </section>
      <p className="ticket-hint">
        <Icon>info</Icon>Apresente este ingresso na entrada do evento.
      </p>
    </main>
  );
}

export function SharedTicketPage() {
  const { shareToken = "" } = useParams();
  const [ticket, setTicket] = useState<MyTicket | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSharedTicket(shareToken)
      .then(setTicket)
      .catch(() => setError("Este link de ingresso é inválido."));
  }, [shareToken]);

  if (error) {
    return (
      <main className="ticket-page ticket-state">
        <h1>Ingresso indisponível</h1>
        <p>{error}</p>
        <Link className="button primary" to="/eventos">Ver eventos</Link>
      </main>
    );
  }

  if (!ticket) {
    return <main className="ticket-page ticket-state">Carregando ingresso...</main>;
  }

  return (
    <main className="ticket-page">
      <header>
        <Link to="/eventos" aria-label="Voltar"><Icon>arrow_back</Icon></Link>
        <b>Ingresso compartilhado</b>
        <span />
      </header>
      <section className="digital-ticket">
        <img src={ticket.event.coverUrl ?? images.ticket} alt={ticket.event.title} />
        <div className="ticket-info">
          <small>{ticket.event.category}</small>
          <h1>{ticket.event.title}</h1>
          <p><Icon>calendar_today</Icon>{formatTicketDate(ticket.event.startsAt)}</p>
          <p><Icon>location_on</Icon>{getVenue(ticket)}</p>
        </div>
        <div className="qr-placeholder">
          <QRCodeSVG value={ticket.qrToken ?? ticket.code} size={190} level="M" />
          <strong>{ticket.code}</strong>
          <p>Apresente este QR Code ou informe o código na portaria.</p>
        </div>
        <div className="ticket-meta">
          <span><small>PARTICIPANTE</small><b>{ticket.holderName}</b></span>
          <span><small>INGRESSO</small><b>{ticket.ticketType.name}</b></span>
          <span><small>STATUS</small><b>{statusLabels[ticket.status]}</b></span>
          {ticket.seat && (
            <span><small>ASSENTO</small><b>{ticket.seat.label}</b></span>
          )}
        </div>
      </section>
    </main>
  );
}
