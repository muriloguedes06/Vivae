import { Link } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { Icon } from "../components/Icon";
import { images } from "../data/mockData";

export function MyTicketsPage() {
  return (
    <>
      <AppHeader />
      <main className="page">
        <section className="page-title">
          <h1>Meus ingressos</h1>
          <p>Acompanhe seus próximos eventos e acesse seus ingressos.</p>
        </section>
        <div className="tabs">
          <button className="active">Próximos</button>
          <button>Passados</button>
          <button>Cancelados</button>
        </div>
        <div className="my-tickets">
          <article>
            <img src={images.festival} alt="" />
            <div>
              <small>15 SET • 14:00</small>
              <h2>Neon Nights Festival 2024</h2>
              <p>
                <Icon>location_on</Icon>Parque Maeda, Itu
              </p>
              <span>2 ingressos</span>
            </div>
            <Link className="button primary" to="/ingresso-digital">
              Ver ingressos
            </Link>
          </article>
          <article>
            <img src={images.arctic} alt="" />
            <div>
              <small>24 OUT • 09:00</small>
              <h2>Tech Summit Brasil</h2>
              <p>
                <Icon>location_on</Icon>São Paulo Expo
              </p>
              <span>1 ingresso</span>
            </div>
            <Link className="button secondary" to="/ingresso-digital">
              Ver ingresso
            </Link>
          </article>
        </div>
      </main>
    </>
  );
}

export function DigitalTicketPage() {
  return (
    <main className="ticket-page">
      <header>
        <Link to="/meus-ingressos">
          <Icon>arrow_back</Icon>
        </Link>
        <b>Seu Ingresso</b>
        <button>
          <Icon>ios_share</Icon>
        </button>
      </header>
      <section className="digital-ticket">
        <img src={images.ticket} alt="Global Tech Summit 2024" />
        <div className="ticket-info">
          <small>CONFERÊNCIA</small>
          <h1>Global Tech Summit 2024</h1>
          <p>
            <Icon>calendar_today</Icon>24 Outubro 2024 • 09:00
          </p>
          <p>
            <Icon>location_on</Icon>São Paulo Expo
          </p>
        </div>
        <div className="qr-placeholder">
          <Icon>qr_code_2</Icon>
          <p>Aumente o brilho da tela</p>
        </div>
        <div className="ticket-meta">
          <span>
            <small>PARTICIPANTE</small>
            <b>Mariana Costa</b>
          </span>
          <span>
            <small>INGRESSO</small>
            <b>VIP Access</b>
          </span>
          <span>
            <small>PEDIDO</small>
            <b>#EP-84920</b>
          </span>
        </div>
      </section>
      <p className="ticket-hint">
        <Icon>info</Icon>Apresente este QR Code na entrada do evento.
      </p>
    </main>
  );
}
