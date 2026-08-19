import { Link } from "react-router-dom";
import type { EventItem } from "../types";
import { formatCurrency } from "../utils/formatters";
import { Icon } from "./Icon";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link className="event-card" to={`/eventos/${event.id}`}>
      <div className="event-image">
        <img src={event.image} alt={event.title} />
        <span>
          <Icon>{event.category === "Filme" ? "movie" : "music_note"}</Icon>
          {event.category}
        </span>
      </div>
      <div className="event-content">
        <small>{event.date}</small>
        <h3>{event.title}</h3>
        <p>
          <Icon>location_on</Icon>
          {event.venue}, {event.city}
        </p>
        <footer>
          {event.price > 0 ? (
            <>
              {event.maxPrice && event.maxPrice !== event.price ? (
                <strong>
                  {formatCurrency(event.price, event.currency)} –{" "}
                  {formatCurrency(event.maxPrice, event.currency)}
                </strong>
              ) : (
                <>
                  A partir de{" "}
                  <strong>{formatCurrency(event.price, event.currency)}</strong>
                </>
              )}
            </>
          ) : (
            <strong>Consulte os ingressos</strong>
          )}
        </footer>
      </div>
    </Link>
  );
}
