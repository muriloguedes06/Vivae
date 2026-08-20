import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { images } from "../data/mockData";
import { useScanner } from "../hooks/useScanner";
import { useMobileDevice } from "../hooks/useMobileDevice";
import { validateTicket } from "../api/api";
import { usePublishedEvents } from "../hooks/useLocalEvents";

interface GateValidationResult {
  valid: boolean;
  status: "VALID" | "ALREADY_USED" | "INVALID" | "CANCELLED_TICKET" | "WRONG_EVENT";
  message: string;
  eventName?: string;
  participantName?: string;
  ticketType?: string;
  expiresAt?: string;
  code: string;
}

export function SmartScannerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { events, loading: loadingEvents } = usePublishedEvents();
  const [eventId, setEventId] = useState(searchParams.get("eventId") ?? "");
  const [manualMode, setManualMode] = useState(false);
  const [code, setCode] = useState("");
  const [validationError, setValidationError] = useState("");
  const [validating, setValidating] = useState(false);
  const isMobileDevice = useMobileDevice();
  const {
    videoRef,
    status,
    scannedCode,
    flashlight,
    decoderAvailable,
    startCamera,
    toggleFlashlight,
  } = useScanner(isMobileDevice && !manualMode && Boolean(eventId));

  const validateCode = useCallback(async (value: string) => {
    if (!value.trim() || !eventId) {
      setValidationError("Selecione o evento antes de validar.");
      return;
    }

    setValidating(true);
    setValidationError("");
    try {
      const result = await validateTicket(value, eventId);
      navigate("/portaria/resultado", { state: { result, eventId } });
    } catch {
      setValidationError("Não foi possível validar o ingresso.");
      setValidating(false);
    }
  }, [eventId, navigate]);

  useEffect(() => {
    if (!scannedCode) return;

    const validation = window.setTimeout(() => void validateCode(scannedCode), 0);
    return () => window.clearTimeout(validation);
  }, [scannedCode, validateCode]);

  const showManualForm = !isMobileDevice || manualMode;

  return (
    <main
      className={`smart-scanner ${flashlight ? "flashlight" : ""}`}
      style={{
        backgroundImage: `linear-gradient(rgba(24,35,55,.82),rgba(24,35,55,.9)),url(${images.scanner})`,
      }}
    >
      <header>
        <div>
          <h1>Portaria</h1>
          <small>Validação de ingressos</small>
        </div>
        <Link to="/eventos" aria-label="Sair da portaria">
          <Icon>logout</Icon>
        </Link>
      </header>
      <section>
        <label className="gate-event-select">
          Evento desta portaria
          <select
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            disabled={loadingEvents || validating}
          >
            <option value="">{loadingEvents ? "Carregando eventos..." : "Selecione o evento"}</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </label>

        {isMobileDevice && !manualMode && (
          <>
            <p>Aponte a câmera traseira para o QR Code do ingresso.</p>
            <div className={`scanner-frame ${status === "active" ? "camera-active" : ""}`}>
              <video ref={videoRef} muted playsInline aria-label="Imagem da câmera" />
              <i className="corner top-left" />
              <i className="corner top-right" />
              <i className="corner bottom-left" />
              <i className="corner bottom-right" />
              {status === "active" && <span className="scan-line" />}
              {status !== "active" && (
                <span className="camera-placeholder"><Icon>photo_camera</Icon></span>
              )}
            </div>

            {status === "idle" && eventId && (
              <button className="button primary camera-permission" onClick={() => void startCamera()}>
                <Icon>photo_camera</Icon>Permitir câmera
              </button>
            )}
            {status === "requesting" && <p className="camera-message">Aguardando permissão...</p>}
            {status === "denied" && (
              <p className="camera-message error">Permissão negada. Libere a câmera nas configurações do navegador ou digite o código.</p>
            )}
            {status === "unsupported" && (
              <p className="camera-message error">Este navegador não disponibiliza acesso à câmera.</p>
            )}
            {status === "error" && (
              <p className="camera-message error">Não foi possível abrir a câmera. Verifique se ela está sendo usada por outro aplicativo.</p>
            )}
            {status === "active" && !decoderAvailable && (
              <p className="camera-message error">A câmera abriu, mas este navegador não possui leitor QR nativo. Use a digitação manual.</p>
            )}
          </>
        )}

        {showManualForm && (
          <form
            className="manual-code-form"
            onSubmit={(event) => {
              event.preventDefault();
              void validateCode(code);
            }}
          >
            <label htmlFor="ticket-code">Código do ingresso</label>
            <div>
              <input
                id="ticket-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Ex.: VIVAE-A1B2C3"
                autoFocus
              />
              <button className="button primary" type="submit" disabled={validating}>
                {validating ? "Validando..." : "Validar"}
              </button>
            </div>
            <small>
              Digite o código exibido abaixo do QR Code do ingresso.
            </small>
            {validationError && <p className="camera-message error">{validationError}</p>}
          </form>
        )}

        {isMobileDevice && (
          <div className="scanner-controls">
            {status === "active" && !manualMode && (
              <button
                className={`flash-button ${flashlight ? "active" : ""}`}
                onClick={() => void toggleFlashlight()}
                aria-label="Alternar lanterna"
              >
                <Icon>{flashlight ? "flashlight_off" : "flashlight_on"}</Icon>
              </button>
            )}
            <button className="manual-button" onClick={() => setManualMode((current) => !current)}>
              <Icon>{manualMode ? "qr_code_scanner" : "keyboard"}</Icon>
              {manualMode ? "Voltar ao leitor" : "Digitar código"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export function GateValidationResultPage() {
  const location = useLocation();
  const result = (location.state as { result?: GateValidationResult } | null)
    ?.result;
  const eventId = (location.state as { eventId?: string } | null)?.eventId;

  if (!result) {
    return <Navigate to="/portaria" replace />;
  }

  return (
    <main className={`gate-success ${result.valid ? "valid" : "invalid"}`}>
      <header>
        <Link to="/portaria">
          <Icon>close</Icon>
        </Link>
        <b>VALIDAÇÃO</b>
        <span />
      </header>
      <section>
        <div className="success-icon">
          <Icon>{result.valid ? "check" : "close"}</Icon>
        </div>
        <h1>{result.valid ? "Ingresso válido" : "Ingresso recusado"}</h1>
        <p>{result.message}</p>
        <article>
          <small>EVENTO</small>
          <h2>{result.eventName ?? "Evento não identificado"}</h2>
          <hr />
          <div>
            <span>
              <small>PARTICIPANTE</small>
              <b>{result.participantName ?? "Não identificado"}</b>
            </span>
            <span>
              <small>INGRESSO</small>
              <b>{result.ticketType ?? "Não informado"}</b>
            </span>
            <span>
              <small>VALIDADE</small>
              <b>{result.expiresAt ? new Date(result.expiresAt).toLocaleString("pt-BR") : "Não informada"}</b>
            </span>
            <span>
              <small>STATUS</small>
              <b>{result.status}</b>
            </span>
          </div>
          <small className="validation-code">CÓDIGO: {result.code}</small>
        </article>
        <Link
          className="button primary wide"
          to={`/portaria${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""}`}
        >
          Validar próximo ingresso
        </Link>
      </section>
    </main>
  );
}
