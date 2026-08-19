import { useSeatSelection } from "../hooks/useSeatSelection";
import { formatCurrency } from "../utils/formatters";

interface SeatMapProps {
  compact?: boolean;
  rows?: number;
  columns?: number;
}

export function SeatMap({ compact = false, rows, columns }: SeatMapProps) {
  const rowCount = rows ?? (compact ? 5 : 6);
  const columnCount = columns ?? (compact ? 8 : 10);
  const { seats, selected, toggle } = useSeatSelection(rowCount, columnCount);

  return (
    <div className="seat-layout">
      <div className="screen">TELA / PALCO</div>
      <div
        className={`seat-grid ${compact ? "compact" : ""}`}
        style={{
          gridTemplateColumns: `repeat(${columnCount}, ${compact ? "30px" : "38px"})`,
        }}
      >
        {seats.map((seat) => (
          <button
            key={seat.id}
            title={seat.id}
            disabled={seat.occupied}
            className={`seat ${seat.occupied ? "occupied" : ""} ${selected.includes(seat.id) ? "selected" : ""}`}
            onClick={() => toggle(seat.id)}
          >
            {seat.number}
          </button>
        ))}
      </div>
      {!compact && (
        <div className="seat-summary">
          <span>
            <b>{selected.length} ingressos</b>
            <small>
              {selected.length ? selected.join(", ") : "Nenhum assento"}
            </small>
          </span>
          <strong>{formatCurrency(selected.length * 70)}</strong>
        </div>
      )}
    </div>
  );
}
