import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { FormField } from "../components/FormField";
import { Icon } from "../components/Icon";
import { SeatMap } from "../components/SeatMap";
import { useCountdown } from "../hooks/useCountdown";
import { formatCardNumber, formatCurrency, formatExpiry } from "../utils/formatters";
import { useTicketmasterEvent } from "../hooks/useTicketmasterEvent";
import { ticketmasterToEventItem } from "../utils/ticketmaster";
import { clearPurchaseDraft, getPurchaseDraft } from "../utils/purchaseDraft";

export function SeatsPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") ?? undefined;
  const { event: ticketmasterEvent } = useTicketmasterEvent(eventId);
  const event = ticketmasterEvent
    ? ticketmasterToEventItem(ticketmasterEvent)
    : undefined;

  if (!eventId) return <Navigate to="/eventos" replace />;

  return (
    <>
      <AppHeader />
      <main className="page">
        <Link className="back" to={`/eventos/${eventId}`}>
          <Icon>arrow_back</Icon>Voltar
        </Link>
        <div className="seat-page">
          <section>
            <small>{event?.date ?? "Carregando evento..."}</small>
            <h1>{event?.title ?? "Evento"}</h1>
            <p>Escolha até 6 assentos no mapa abaixo.</p>
            <SeatMap />
          </section>
          <aside className="purchase-card">
            <h2>Resumo do Pedido</h2>
            <p>Ingresso Inteira × 2</p>
            <strong>R$ 140,00</strong>
            <Link
              className="button primary wide"
              to={`/checkout?eventId=${encodeURIComponent(eventId)}`}
            >
              Ir para pagamento
            </Link>
          </aside>
        </div>
      </main>
    </>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") ?? undefined;
  const [draft] = useState(() => getPurchaseDraft(eventId));
  const { event: ticketmasterEvent, loading, error } =
    useTicketmasterEvent(eventId);
  const fetchedEvent = ticketmasterEvent
    ? ticketmasterToEventItem(ticketmasterEvent)
    : undefined;
  const selectedEvent = draft?.event ?? fetchedEvent;
  const total = draft?.total ?? 0;
  const timer = useCountdown(600);
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    setProcessing(true);
    window.setTimeout(() => {
      setSuccess(true);
      window.setTimeout(
        () => navigate(`/sucesso?eventId=${encodeURIComponent(eventId ?? "")}`),
        1200,
      );
    }, 2200);
  }

  if (!eventId) return <Navigate to="/eventos" replace />;

  if (loading && !selectedEvent) {
    return <main className="center-page">Carregando pedido...</main>;
  }

  if (error || !selectedEvent) {
    return (
      <main className="center-page">
        <div className="error-banner">Pedido ou evento não encontrado.</div>
        <Link className="button primary" to="/eventos">Voltar aos eventos</Link>
      </main>
    );
  }
  return (
    <>
      <AppHeader />
      <main className="page checkout-page">
        <header>
          <div>
            <h1>Finalizar Pedido</h1>
            <p>Complete seus dados para garantir seus ingressos.</p>
          </div>
          <div className={`timer ${timer.seconds < 60 ? "urgent" : ""}`}>
            <Icon>timer</Icon>
            <span>
              Sua reserva expira em <b>{timer.display}</b>
            </span>
          </div>
        </header>
        <div className="checkout-columns">
          <form className="payment-form" onSubmit={submit}>
            <h2>Dados de Pagamento</h2>
            <FormField
              label="Nome no cartão"
              placeholder="NOME COMO ESTÁ NO CARTÃO"
              required
            />
            <FormField
              label="Número do cartão"
              icon="credit_card"
              value={card}
              onChange={(e) => setCard(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              required
            />
            <div className="two-columns">
              <FormField
                label="Validade"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/AA"
                required
              />
              <FormField label="CVV" placeholder="123" maxLength={4} required />
            </div>
            <div className="notice">
              <Icon>info</Icon>
              <span>
                <b>Aviso Importante</b>Este é um pagamento simulado. Nenhuma
                cobrança real será feita.
              </span>
            </div>
            <button className="button primary wide" disabled={processing}>
              {processing ? (
                <>
                  <span className="spinner" /> Processando...
                </>
              ) : (
                <>
                  <Icon>lock</Icon>Pagar {formatCurrency(total)}
                </>
              )}
            </button>
          </form>
          <aside className="order-card">
            <h2>Resumo do Pedido</h2>
            <img src={selectedEvent.image} alt={selectedEvent.title} />
            <h3>{selectedEvent.title}</h3>
            <p>{selectedEvent.date}</p>
            <p>{selectedEvent.venue}, {selectedEvent.city}</p>
            <hr />
            {draft?.lines.map((line) => (
              <span key={line.ticketTypeId}>
                {line.quantity} × {line.name}
                <b>{formatCurrency(line.quantity * line.unitPrice)}</b>
              </span>
            ))}
            {!draft?.lines.length && (
              <span>Nenhum ingresso selecionado <b>—</b></span>
            )}
            <span>
              Taxas <b>Grátis</b>
            </span>
            <hr />
            <strong>
              Total <b>{formatCurrency(total)}</b>
            </strong>
          </aside>
        </div>
        {processing && (
          <div className="modal-backdrop">
            <div className={`process-modal ${success ? "success" : ""}`}>
              {success ? (
                <>
                  <Icon>check_circle</Icon>
                  <h2>Pagamento Aprovado!</h2>
                  <p>Sua reserva foi confirmada com sucesso.</p>
                </>
              ) : (
                <>
                  <span className="large-spinner" />
                  <h2>Processando Pagamento</h2>
                  <p>Aguarde enquanto confirmamos sua transação.</p>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  useEffect(() => {
    clearPurchaseDraft();
  }, []);

  return (
    <main className="center-page success-page">
      <section>
        <div className="success-icon">
          <Icon>check</Icon>
        </div>
        <h1>Pagamento aprovado!</h1>
        <p>
          Seus ingressos já estão disponíveis. Enviamos também uma confirmação
          para o seu e-mail.
        </p>
        <Link
          className="button primary wide"
          to={`/ingresso-digital${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""}`}
        >
          Ver meu ingresso
        </Link>
        <Link className="button secondary wide" to="/eventos">
          Voltar aos eventos
        </Link>
      </section>
    </main>
  );
}
