import { useEffect, useState, type FormEvent } from "react";

import {
  countBySource,
  decodeHtmlEntities,
  filterPosts,
  formatPostDate,
  snippetRepeatsTitle,
  sourceLabel,
} from "../debate/socialPosts";
import {
  gorillaApi,
  type SocialPost,
  type SocialSearchResults,
} from "../services/api";
import "./DebatePage.css";

export const PAGE_SIZE = 12;

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: SocialSearchResults };

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function DebatePage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [source, setSource] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [newQuery, setNewQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    let active = true;

    gorillaApi
      .getResults()
      .then((data) => {
        if (active) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: "error",
            message: errorMessage(
              error,
              "Não foi possível carregar as manifestações públicas.",
            ),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  async function handleNewSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = newQuery.trim();
    if (!query) {
      setSearchError("Informe um tema para a nova busca.");
      return;
    }

    setSearching(true);
    setSearchError("");
    try {
      const data = await gorillaApi.fetchAndSave(query);
      setState({ status: "ready", data });
      setKeyword("");
      setSource("");
      setVisibleCount(PAGE_SIZE);
    } catch (error) {
      setSearchError(errorMessage(error, "Não foi possível fazer a busca."));
    } finally {
      setSearching(false);
    }
  }

  const posts = state.status === "ready" ? state.data.results : [];
  const filtered = filterPosts(posts, { keyword, source });
  const visible = filtered.slice(0, visibleCount);

  return (
    <section className="page-card debate-page">
      <h1>Opinião Pública</h1>
      <p className="page-lead">
        Manifestações públicas em redes sociais coletadas pelo Gorilla, um
        serviço de busca em redes. Use os filtros para encontrar publicações
        sobre um tema.
      </p>

      {state.status === "loading" && (
        <p role="status" className="feedback">
          Carregando manifestações...
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
              setAttempt((value) => value + 1);
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {state.status === "ready" && (
        <>
          <p className="search-summary">
            {state.data.query ? (
              <>
                Última busca: <strong>“{state.data.query}”</strong>,{" "}
              </>
            ) : null}
            {posts.length} publicações em{" "}
            {countBySource(posts)
              .map(
                ({ source: name, count }) => `${sourceLabel(name)} (${count})`,
              )
              .join(", ") || "nenhuma fonte"}
            .
          </p>

          <div className="filters">
            <label>
              Palavra-chave
              <input
                type="search"
                value={keyword}
                placeholder="Filtrar por título, texto ou autor"
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              />
            </label>
            <label>
              Fonte
              <select
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                <option value="">Todas as fontes</option>
                {countBySource(posts).map(({ source: name }) => (
                  <option key={name} value={name}>
                    {sourceLabel(name)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="muted" aria-live="polite">
            {filtered.length === posts.length
              ? `Mostrando ${visible.length} de ${posts.length} publicações.`
              : `${filtered.length} publicações encontradas. Mostrando ${visible.length}.`}
          </p>

          {filtered.length === 0 ? (
            <p className="feedback">
              Nenhuma publicação encontrada para esse filtro.
            </p>
          ) : (
            <ul className="post-list">
              {visible.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </ul>
          )}

          {visible.length < filtered.length && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Mostrar mais
            </button>
          )}
        </>
      )}

      <form
        className="new-search"
        onSubmit={(event) => void handleNewSearch(event)}
      >
        <h2>Nova busca no Gorilla</h2>
        <p className="muted">
          Busca um tema nas redes e substitui os resultados salvos. Termos
          curtos e específicos funcionam melhor, como “orçamento Unicamp” ou
          “greve Unicamp”. A busca pode levar até 3 minutos, exige a variável{" "}
          <code>GORILLA_API_KEY</code> no backend e consome créditos da API.
        </p>
        <div className="new-search-row">
          <label>
            Tema da busca
            <input
              value={newQuery}
              placeholder="Ex.: orçamento Unicamp"
              onChange={(event) => setNewQuery(event.target.value)}
            />
          </label>
          <button type="submit" className="primary-button" disabled={searching}>
            {searching ? "Buscando... (até 3 minutos)" : "Buscar"}
          </button>
        </div>
        {searchError && (
          <p role="alert" className="feedback error">
            {searchError}
          </p>
        )}
      </form>
    </section>
  );
}

function PostCard({ post }: { post: SocialPost }) {
  const date = formatPostDate(post.created_utc);
  const showTitle = !snippetRepeatsTitle(post);

  return (
    <li className="post-card">
      <div className="post-meta">
        <span className={`source-badge ${post.source}`}>
          {sourceLabel(post.source)}
        </span>
        <span>{post.author}</span>
        {date && <span>{date}</span>}
      </div>
      {showTitle && <h3>{decodeHtmlEntities(post.title)}</h3>}
      <p className="post-snippet">{decodeHtmlEntities(post.body_snippet)}</p>
      <div className="post-footer">
        {post.score !== undefined && <span>{post.score} reações</span>}
        {post.num_comments !== undefined && (
          <span>{post.num_comments} comentários</span>
        )}
        <a href={post.url} target="_blank" rel="noreferrer">
          Abrir publicação original
        </a>
      </div>
    </li>
  );
}
