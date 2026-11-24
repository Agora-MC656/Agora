import { NavLink, Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./useAuth";
import LoginPage from "./pages/LoginPage";
import OrcamentoPage from "./pages/OrcamentoPage";

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <nav className="navbar" aria-label="Navegacao principal">
        <NavLink className="brand" to="/">
          Ágora — IC/UNICAMP
        </NavLink>
        <div className="nav-links">
          <NavLink to="/">Início</NavLink>
          <NavLink to="/orcamento">Orçamento</NavLink>
          <NavLink to="/votacao">Votação</NavLink>
          <NavLink to="/debate">Debate</NavLink>
          {user ? (
            <>
              <span className="session-status">Olá, {user.nameEmail}</span>
              <button type="button" onClick={logout}>
                Sair
              </button>
            </>
          ) : (
            <NavLink to="/login">Entrar</NavLink>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orcamento" element={<OrcamentoPage />} />
          <Route path="/votacao" element={<VotacaoPage />} />
          <Route path="/debate" element={<DebatePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage() {
  return (
    <section className="page-card">
      <h1>Ágora — participação acadêmica no IC/UNICAMP</h1>
      <p>
        O Ágora aproxima a comunidade do Instituto de Computação para acompanhar
        o orçamento, participar de pautas e compartilhar opiniões públicas.
      </p>
      <div className="home-actions">
        <NavLink to="/orcamento">Consultar orçamento IC</NavLink>
        <NavLink to="/votacao">Acompanhar pautas e votar</NavLink>
        <NavLink to="/debate">Explorar opinião pública</NavLink>
      </div>
    </section>
  );
}

function VotacaoPage() {
  return (
    <section className="placeholder-card">
      {/* TODO: Integrante 3 - Pautas e Votação */}
      <h1>Pautas e Votação</h1>
      <p>Espaço reservado para pautas, registro e apuração de votos.</p>
    </section>
  );
}

function DebatePage() {
  return (
    <section className="placeholder-card">
      {/* TODO: Integrante 4 - Opinião Pública / Gorilla */}
      <h1>Opinião Pública</h1>
      <p>Espaço reservado para buscas e resultados do Gorilla.</p>
    </section>
  );
}

export default Layout;
