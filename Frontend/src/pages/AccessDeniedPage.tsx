import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";

export function AccessDeniedPage() {
  return (
    <main className="center-page">
      <section className="access-denied">
        <Icon>lock</Icon>
        <h1>Acesso não autorizado</h1>
        <p>Seu cargo não permite acessar esta área.</p>
        <Link className="button primary" to="/eventos">
          Voltar aos eventos
        </Link>
      </section>
    </main>
  );
}
