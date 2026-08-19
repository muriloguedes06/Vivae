import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { images } from "../data/mockData";
import { useScanner } from "../hooks/useScanner";

interface GateValidationResult {
  valid: boolean;
  status: "VALID" | "EXPIRED" | "ALREADY_USED" | "INVALID";
  message: string;
  eventName?: string;
  participantName?: string;
  ticketType?: string;
  expiresAt?: string;
  code: string;
}

function simulateValidation(code: string): GateValidationResult {
  const normalizedCode = code.trim().toUpperCase();

  if (normalizedCode.includes("EXPIRADO")) {
    return {
      valid: false,
      status: "EXPIRED",
      message: "Este ingresso passou da data de validade.",
      eventName: "Festival Vivaê 2026",
      expiresAt: "18/08/2026 às 23:59",
      code,
    };
  }

  if (normalizedCode.includes("USADO")) {
    return {
      valid: false,
      status: "ALREADY_USED",
      message: "Este ingresso já foi utilizado na portaria.",
      eventName: "Festival Vivaê 2026",
      participantName: "Mariana Costa",
      code,
    };
  }

  if (!normalizedCode || normalizedCode.includes("INVALIDO")) {
    return {
      valid: false,
      status: "INVALID",
      message: "Código não encontrado ou assinatura inválida.",
      code,
    };
  }

  return {
    valid: true,
    status: "VALID",
    message: "Acesso liberado.",
    eventName: "Festival Vivaê 2026",
    participantName: "Mariana Costa",
    ticketType: "Pista Premium",
    expiresAt: "19/08/2026 às 23:59",
    code,
  };
}

export function SmartScannerPage() {
  const { scanned, flashlight, toggleFlashlight } = useScanner();
  const navigate = useNavigate();
  const [manualMode, setManualMode] = useState(false);
  const [code, setCode] = useState("");

  function validateCode(value: string) {
    navigate("/portaria/resultado", {
      state: { result: simulateValidation(value) },
    });
  }

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
        <p>Aponte a câmera para o QR Code do ingresso</p>
        <button
          aria-label="Simular leitura do QR Code"
          onClick={() => validateCode("VIVAE-DEMO-2026")}
          className={`scanner-frame ${scanned ? "scanned" : ""}`}
        >
          <i className="corner top-left" />
          <i className="corner top-right" />
          <i className="corner bottom-left" />
          <i className="corner bottom-right" />
          <span className="scan-line" />
          {scanned && (
            <span className="scan-success">
              <Icon>qr_code_scanner</Icon>
            </span>
          )}
        </button>

        {manualMode && (
          <form
            className="manual-code-form"
            onSubmit={(event) => {
              event.preventDefault();
              validateCode(code);
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
              <button className="button primary" type="submit">
                Validar
              </button>
            </div>
            <small>
              Para testar recusas, use “EXPIRADO”, “USADO” ou “INVALIDO”.
            </small>
          </form>
        )}

        <div className="scanner-controls">
          <button
            className={`flash-button ${flashlight ? "active" : ""}`}
            onClick={toggleFlashlight}
            aria-label="Alternar lanterna"
          >
            <Icon>{flashlight ? "flashlight_off" : "flashlight_on"}</Icon>
          </button>
          <button
            className="manual-button"
            onClick={() => setManualMode((current) => !current)}
          >
            <Icon>{manualMode ? "qr_code_scanner" : "keyboard"}</Icon>
            {manualMode ? "Voltar ao leitor" : "Digitar código"}
          </button>
        </div>
      </section>
    </main>
  );
}

export function GateValidationResultPage() {
  const location = useLocation();
  const result = (location.state as { result?: GateValidationResult } | null)
    ?.result;

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
              <b>{result.expiresAt ?? "Não informada"}</b>
            </span>
            <span>
              <small>STATUS</small>
              <b>{result.status}</b>
            </span>
          </div>
          <small className="validation-code">CÓDIGO: {result.code}</small>
        </article>
        <Link className="button primary wide" to="/portaria">
          Validar próximo ingresso
        </Link>
      </section>
    </main>
  );
}
