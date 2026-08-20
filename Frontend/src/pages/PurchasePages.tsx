import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { FormField } from "../components/FormField";
import { Icon } from "../components/Icon";
import { useCountdown } from "../hooks/useCountdown";
import { formatCardNumber, formatCurrency, formatExpiry } from "../utils/formatters";
import { clearPurchaseDraft, getPurchaseDraft, savePurchaseDraft } from "../utils/purchaseDraft";
import { usePublishedEvent } from "../hooks/useLocalEvents";
import { localEventToEventItem } from "../utils/localEvents";
import { createOrder, simulatePayment } from "../api/api";

export function SeatsPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") ?? undefined;
  const { event: localEvent, loading, error } = usePublishedEvent(eventId);
  const event = localEvent ? localEventToEventItem(localEvent) : undefined;
  const [selected, setSelected] = useState<string[]>([]);
  const ticketType = localEvent?.ticketTypes[0];
  const columns = localEvent?.seats.length
    ? Math.max(...localEvent.seats.map((seat) => seat.number))
    : 1;

  function toggleSeat(id: string) {
    setSelected((current) => current.includes(id)
      ? current.filter((seatId) => seatId !== id)
      : current.length < 6 ? [...current, id] : current);
  }

  if (!eventId) return <Navigate to="/eventos" replace />;
  if (loading) return <main className="center-page">Carregando assentos...</main>;
  if (error || !localEvent || !event || localEvent.ticketingMode !== "RESERVED_SEATING") {
    return <main className="center-page"><p className="error-banner">Mapa de assentos indisponível.</p></main>;
  }

  const selectedSeats = localEvent.seats.filter((seat) => selected.includes(seat.id));
  const total = selected.length * (ticketType?.price ?? 0);

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
            <div className="seat-layout">
              <div className="screen">TELA</div>
              <div className="seat-grid" style={{ gridTemplateColumns: `repeat(${columns}, 38px)` }}>
                {localEvent.seats.map((seat) => (
                  <button
                    key={seat.id}
                    title={seat.label}
                    disabled={seat.occupied}
                    className={`seat ${seat.occupied ? "occupied" : ""} ${selected.includes(seat.id) ? "selected" : ""}`}
                    onClick={() => toggleSeat(seat.id)}
                  >
                    {seat.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <aside className="purchase-card">
            <h2>Resumo do Pedido</h2>
            <p>{selectedSeats.length ? `Assentos: ${selectedSeats.map((seat) => seat.label).join(", ")}` : "Nenhum assento selecionado"}</p>
            <strong>{formatCurrency(total)}</strong>
            <Link
              className={`button primary wide ${selected.length ? "" : "disabled"}`}
              to={`/checkout?eventId=${encodeURIComponent(eventId)}`}
              onClick={() => ticketType && savePurchaseDraft({
                event,
                total,
                lines: [{
                  ticketTypeId: ticketType.id,
                  name: ticketType.name,
                  quantity: selected.length,
                  unitPrice: ticketType.price,
                  seatIds: selectedSeats.map((seat) => seat.id),
                  seatLabels: selectedSeats.map((seat) => seat.label),
                }],
              })}
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
  const { event: localEvent, loading, error } = usePublishedEvent(eventId);
  const fetchedEvent = localEvent ? localEventToEventItem(localEvent) : undefined;
  const selectedEvent = draft?.event ?? fetchedEvent;
  const total = draft?.total ?? 0;
  const timer = useCountdown(600);
  const [cardholderName, setCardholderName] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!eventId || !draft?.lines.length) {
      setPaymentError("Selecione ao menos um ingresso antes de pagar.");
      return;
    }
    setProcessing(true);
    setPaymentError("");
    try {
      const order = await createOrder({
        eventId,
        items: draft.lines.map((line) => ({
          ticketTypeId: line.ticketTypeId,
          quantity: line.seatIds?.length ? undefined : line.quantity,
          seatIds: line.seatIds,
        })),
      });
      const payment = await simulatePayment({
        orderId: order.id,
        cardholderName,
        cardNumber: card,
        expiry,
        cvv,
      });
      if (!payment.approved) {
        setPaymentError("Pagamento recusado. Confira os dados do cartão de teste.");
        setProcessing(false);
        return;
      }

      const ticketId = payment.tickets[0]?.id;
      if (!ticketId) {
        setPaymentError("O pagamento foi aprovado, mas nenhum ingresso foi emitido.");
        setProcessing(false);
        return;
      }

      setSuccess(true);
      window.setTimeout(
        () => navigate(`/sucesso?ticketId=${encodeURIComponent(ticketId)}`),
        1200,
      );
    } catch {
      setPaymentError("Não foi possível concluir o pagamento. A reserva pode ter expirado ou o ingresso não está mais disponível.");
      setProcessing(false);
    }
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
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
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
              <FormField
                label="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
            <small>Cartão de teste: Murilo Guedes · 4242 4242 4242 4242 · 01/35 · 426</small>
            {paymentError && <p className="error-banner">{paymentError}</p>}
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
  const ticketId = searchParams.get("ticketId");

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
          to={ticketId
            ? `/ingresso-digital?ticketId=${encodeURIComponent(ticketId)}`
            : "/meus-ingressos"}
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
