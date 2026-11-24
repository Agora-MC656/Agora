import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  votingApi,
  type VoteOption,
  type VotingProposalSummary,
} from "../services/api";
import { useAuth } from "../useAuth";
import "./VotacaoPage.css";

const OPTION_LABELS: Record<VoteOption, string> = {
  sim: "Sim",
  nao: "Não",
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; proposals: VotingProposalSummary[] };

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function VotacaoPage() {
  const { user } = useAuth();
  const voterId = user?.nameEmail;
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    votingApi
      .listProposals(voterId)
      .then((proposals) => {
        if (active) setState({ status: "ready", proposals });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: "error",
            message: errorMessage(
              error,
              "Não foi possível carregar as pautas.",
            ),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [voterId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return (
    <section className="page-card voting-page">
      <p className="eyebrow">
        <span className="accent">02 · Votação</span> · Consulta consultiva
      </p>
      <h1>Pautas e Votação</h1>
      <p className="page-lead">
        Consulta consultiva sobre prioridades do orçamento do IC. O resultado
        mostra a opinião da comunidade e não altera o orçamento por si só.
      </p>

      <div className="rules" aria-label="Regras da consulta">
        <h2>Regras</h2>
        <ul>
          <li>É preciso entrar na conta para votar.</li>
          <li>Cada pessoa vota uma única vez por pauta, em Sim ou Não.</li>
          <li>O voto não pode ser alterado depois de confirmado.</li>
          <li>A apuração é parcial e é atualizada a cada voto.</li>
        </ul>
      </div>

      {!user && (
        <p className="feedback">
          Você pode acompanhar a apuração sem conta.{" "}
          <NavLink to="/login">Entre no Ágora</NavLink> para votar.
        </p>
      )}

      {state.status === "loading" && (
        <p role="status" className="feedback">
          Carregando pautas...
        </p>
      )}

      {state.status === "error" && (
        <div role="alert" className="feedback error">
          <p>{state.message}</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setState({ status: "loading" });
              reload();
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {state.status === "ready" && state.proposals.length === 0 && (
        <p className="feedback">Nenhuma pauta aberta no momento.</p>
      )}

      {state.status === "ready" && (
        <div className="proposal-list">
          {state.proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              voterId={voterId}
              onVoted={reload}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type ProposalCardProps = {
  proposal: VotingProposalSummary;
  voterId: string | undefined;
  onVoted: () => void;
};

function ProposalCard({ proposal, voterId, onVoted }: ProposalCardProps) {
  const [pending, setPending] = useState<VoteOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const titleId = `pauta-${proposal.id}`;

  async function confirmVote(option: VoteOption) {
    if (!voterId) return;
    setSubmitting(true);
    setError("");
    try {
      await votingApi.castVote(proposal.id, voterId, option);
      setPending(null);
      onVoted();
    } catch (caught) {
      setError(errorMessage(caught, "Não foi possível registrar o voto."));
      setPending(null);
      onVoted();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="proposal-card" aria-labelledby={titleId}>
      <p className="budget-reference">{proposal.budgetReference}</p>
      <h2 id={titleId}>{proposal.title}</h2>
      <p>{proposal.description}</p>

      <VotingResultBars proposal={proposal} />

      {proposal.myVote ? (
        <p role="status" className="feedback success">
          Participação confirmada: você votou{" "}
          <strong>{OPTION_LABELS[proposal.myVote]}</strong> nesta pauta.
        </p>
      ) : voterId ? (
        pending ? (
          <div className="confirm-box" role="group" aria-label="Confirmar voto">
            <p>
              Confirmar voto <strong>{OPTION_LABELS[pending]}</strong>? Depois
              de confirmado, o voto não pode ser alterado.
            </p>
            <div className="vote-actions">
              <button
                type="button"
                className="primary-button"
                disabled={submitting}
                onClick={() => void confirmVote(pending)}
              >
                {submitting ? "Registrando..." : "Confirmar voto"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={submitting}
                onClick={() => setPending(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="vote-actions">
            {(Object.keys(OPTION_LABELS) as VoteOption[]).map((option) => (
              <button
                key={option}
                type="button"
                className="secondary-button"
                onClick={() => {
                  setError("");
                  setPending(option);
                }}
              >
                Votar {OPTION_LABELS[option]}
              </button>
            ))}
          </div>
        )
      ) : null}

      {error && (
        <p role="alert" className="feedback error">
          {error}
        </p>
      )}
    </article>
  );
}

function VotingResultBars({ proposal }: { proposal: VotingProposalSummary }) {
  const { totals, totalVotes } = proposal.result;

  return (
    <div className="result">
      <p className="result-total">
        {totalVotes === 1 ? "1 voto" : `${totalVotes} votos`} até agora
      </p>
      {(Object.keys(OPTION_LABELS) as VoteOption[]).map((option) => {
        const share = totalVotes === 0 ? 0 : totals[option] / totalVotes;
        const percent = Math.round(share * 100);
        return (
          <div key={option} className="result-row">
            <span className="result-label">{OPTION_LABELS[option]}</span>
            <div
              className="result-track"
              role="meter"
              aria-label={`${OPTION_LABELS[option]} em ${proposal.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className={`result-bar ${option}`}
                style={{ width: `${share * 100}%` }}
              />
            </div>
            <span className="result-value">
              {totals[option]} ({percent}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}
