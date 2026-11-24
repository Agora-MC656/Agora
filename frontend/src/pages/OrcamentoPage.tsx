import { useEffect, useMemo, useState } from "react";

import "./OrcamentoPage.css";

import {
  SECTION_GUIDE,
  approvalRate,
  filterItems,
  formatCurrency,
  formatPercent,
  sumItems,
  summarizeBySection,
} from "../budget/budgetSummary";
import { getIcBudgetProposal, type BudgetProposal } from "../services/api";

/** Único exercício com parser disponível no backend. */
export const BUDGET_YEAR = 2020;

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; proposal: BudgetProposal };

const LARGEST_SECTION = "Aportes Específicos";

export default function OrcamentoPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    getIcBudgetProposal(BUDGET_YEAR)
      .then((proposal) => {
        if (active) setState({ status: "ready", proposal });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Não foi possível carregar a proposta orçamentária.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  }

  return (
    <section className="page-card budget-page">
      <h1>Orçamento IC</h1>
      <p className="page-lead">
        Previsão orçamentária de {BUDGET_YEAR} do Instituto de Computação,
        extraída automaticamente do PDF publicado pelo IC.
      </p>

      {state.status === "loading" && (
        <p role="status" className="feedback">
          Carregando a proposta orçamentária. A primeira consulta baixa e lê o
          PDF do site do IC e pode levar alguns segundos.
        </p>
      )}

      {state.status === "error" && (
        <div role="alert" className="feedback error">
          <p>{state.message}</p>
          <button type="button" className="primary-button" onClick={retry}>
            Tentar novamente
          </button>
        </div>
      )}

      {state.status === "ready" && <BudgetReport proposal={state.proposal} />}
    </section>
  );
}

function BudgetReport({ proposal }: { proposal: BudgetProposal }) {
  const [section, setSection] = useState("");
  const [query, setQuery] = useState("");
  const [includeLargest, setIncludeLargest] = useState(true);

  const totals = useMemo(() => sumItems(proposal.items), [proposal.items]);
  const sections = useMemo(
    () => summarizeBySection(proposal.items),
    [proposal.items],
  );
  const chartSections = includeLargest
    ? sections
    : sections.filter((summary) => summary.section !== LARGEST_SECTION);
  const chartMax = Math.max(
    1,
    ...chartSections.map((summary) => summary.estimatedCents),
  );
  const visibleItems = filterItems(proposal.items, { section, query });
  const visibleTotals = sumItems(visibleItems);

  return (
    <>
      <p className="source-note">
        Fonte:{" "}
        <a href={proposal.sourceUrl} target="_blank" rel="noreferrer">
          documento original no site do IC
        </a>
        . Extraído em{" "}
        {new Date(proposal.extractedAt).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        })}
        .
      </p>

      <dl className="stat-grid">
        <div className="stat">
          <dt>Total estimado</dt>
          <dd>{formatCurrency(totals.estimatedCents)}</dd>
        </div>
        <div className="stat">
          <dt>Total aprovado</dt>
          <dd>{formatCurrency(totals.approvedCents)}</dd>
        </div>
        <div className="stat">
          <dt>Aprovado sobre o estimado</dt>
          <dd>{formatPercent(approvalRate(totals))}</dd>
        </div>
        <div className="stat">
          <dt>Itens</dt>
          <dd>{totals.itemCount}</dd>
        </div>
      </dl>

      <h2>Como ler a proposta</h2>
      <ul className="reading-guide">
        <li>
          <strong>Estimativa</strong> é o valor previsto para o item, e{" "}
          <strong>Aprovado</strong> é o valor que a proposta reserva para ele.
        </li>
        <li>
          <strong>Fonte</strong> indica de onde vem o recurso, como a Unicamp ou
          a Funcamp, a fundação de apoio da universidade.
        </li>
        <li>
          <strong>Prioridade</strong> vai de P1, a mais alta, até P4. Alguns
          itens usam outras marcações do documento, como Edital, Evento ou
          Bloqueio Judicial.
        </li>
      </ul>

      <h2>Distribuição por seção</h2>
      <label className="inline-check">
        <input
          type="checkbox"
          checked={includeLargest}
          onChange={(event) => setIncludeLargest(event.target.checked)}
        />
        Incluir {LARGEST_SECTION} no gráfico
      </label>
      <ul className="bar-chart" aria-label="Valores por seção">
        {chartSections.map((summary) => (
          <li key={summary.section}>
            <div className="bar-label">
              <span>{summary.section}</span>
              <span>
                {formatCurrency(summary.approvedCents)} aprovados de{" "}
                {formatCurrency(summary.estimatedCents)}
              </span>
            </div>
            <div className="bar-track" aria-hidden="true">
              <div
                className="bar estimated"
                style={{
                  width: `${(summary.estimatedCents / chartMax) * 100}%`,
                }}
              />
              <div
                className="bar approved"
                style={{
                  width: `${(summary.approvedCents / chartMax) * 100}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="chart-legend" aria-hidden="true">
        <span className="legend estimated" /> Estimado
        <span className="legend approved" /> Aprovado
      </p>

      <h2>O que cada seção cobre</h2>
      <dl className="section-guide">
        {sections.map((summary) => (
          <div key={summary.section}>
            <dt>
              {summary.section}{" "}
              <span className="muted">
                ({summary.itemCount} itens,{" "}
                {formatPercent(summary.approvedCents / totals.approvedCents)} do
                total aprovado)
              </span>
            </dt>
            <dd>
              {SECTION_GUIDE[summary.section] ??
                "Seção sem descrição cadastrada."}
            </dd>
          </div>
        ))}
      </dl>

      <h2>Itens da proposta</h2>
      <div className="filters">
        <label>
          Seção
          <select
            value={section}
            onChange={(event) => setSection(event.target.value)}
          >
            <option value="">Todas as seções</option>
            {sections.map((summary) => (
              <option key={summary.section} value={summary.section}>
                {summary.section}
              </option>
            ))}
          </select>
        </label>
        <label>
          Buscar item
          <input
            type="search"
            value={query}
            placeholder="Ex.: laboratório, Wi-Fi, pintura"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <p className="muted" aria-live="polite">
        {visibleTotals.itemCount} itens, somando{" "}
        {formatCurrency(visibleTotals.approvedCents)} aprovados.
      </p>

      {visibleItems.length === 0 ? (
        <p className="feedback">Nenhum item encontrado para esse filtro.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Descrição</th>
                <th scope="col">Seção</th>
                <th scope="col">Estimativa</th>
                <th scope="col">Aprovado</th>
                <th scope="col">Fonte</th>
                <th scope="col">Prioridade</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item, index) => (
                <tr key={`${item.section}-${item.description}-${index}`}>
                  <td>{item.description}</td>
                  <td>
                    {item.section}
                    {item.subsection && (
                      <span className="muted"> › {item.subsection}</span>
                    )}
                  </td>
                  <td className="number">
                    {formatCurrency(item.estimatedAmountCents)}
                  </td>
                  <td className="number">
                    {formatCurrency(item.approvedAmountCents)}
                  </td>
                  <td>{item.fundingSource}</td>
                  <td>{item.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
