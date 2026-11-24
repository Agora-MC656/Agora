import { NavLink, Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./useAuth";
import DebatePage from "./pages/DebatePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OrcamentoPage from "./pages/OrcamentoPage";
import VotacaoPage from "./pages/VotacaoPage";

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <nav className="navbar" aria-label="Navegacao principal">
        <NavLink className="brand" to="/" aria-label="Ágora, página inicial">
          <span className="brand-mark" aria-hidden="true" />
          Ágora
          <span className="brand-context" aria-hidden="true">
            IC · Unicamp
          </span>
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
      <footer className="site-footer">
        <span>Ágora · Instituto de Computação · Unicamp</span>
        <span>MC656 · Engenharia de Software · 2026</span>
      </footer>
    </div>
  );
}

export default Layout;
