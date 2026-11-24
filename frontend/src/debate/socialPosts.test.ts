import { describe, expect, it } from "vitest";

import type { SocialPost } from "../services/api";
import {
  countBySource,
  decodeHtmlEntities,
  filterPosts,
  formatPostDate,
  snippetRepeatsTitle,
  sourceLabel,
} from "./socialPosts";

function post(overrides: Partial<SocialPost>): SocialPost {
  return {
    id: "1",
    source: "bluesky",
    title: "Título",
    url: "https://example.org/1",
    author: "autor",
    body_snippet: "Trecho",
    ...overrides,
  };
}

const posts: SocialPost[] = [
  post({
    id: "1",
    title: "Orçamento da Unicamp",
    body_snippet: "Debate sobre o orçamento",
    author: "ana.bsky.social",
  }),
  post({
    id: "2",
    source: "youtube",
    title: "Vídeo sobre laboratórios",
    body_snippet: "Novos laboratórios",
    author: "Canal IC",
    channel: "Canal do Instituto",
  }),
  post({ id: "3", title: "Outra", body_snippet: "Nada", author: "bia" }),
];

describe("sourceLabel", () => {
  it("usa o nome conhecido da fonte ou o próprio identificador", () => {
    expect(sourceLabel("youtube")).toBe("YouTube");
    expect(sourceLabel("twitter")).toBe("X (Twitter)");
    expect(sourceLabel("mastodon")).toBe("mastodon");
  });
});

describe("countBySource", () => {
  it("conta por fonte, da mais frequente para a menos frequente", () => {
    expect(countBySource(posts)).toEqual([
      { source: "bluesky", count: 2 },
      { source: "youtube", count: 1 },
    ]);
  });

  it("desempata pela ordem alfabética", () => {
    expect(
      countBySource([post({ source: "youtube" }), post({ source: "reddit" })]),
    ).toEqual([
      { source: "reddit", count: 1 },
      { source: "youtube", count: 1 },
    ]);
  });
});

describe("filterPosts", () => {
  const ids = (list: SocialPost[]) => list.map(({ id }) => id);

  it("retorna tudo sem filtros", () => {
    expect(ids(filterPosts(posts, { keyword: " ", source: "" }))).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("filtra pela fonte", () => {
    expect(ids(filterPosts(posts, { keyword: "", source: "youtube" }))).toEqual(
      ["2"],
    );
  });

  it("busca no título e no trecho sem diferenciar acentos", () => {
    expect(
      ids(filterPosts(posts, { keyword: "ORCAMENTO", source: "" })),
    ).toEqual(["1"]);
    expect(
      ids(filterPosts(posts, { keyword: "laboratorios", source: "" })),
    ).toEqual(["2"]);
  });

  it("busca no autor e no canal", () => {
    expect(ids(filterPosts(posts, { keyword: "bia", source: "" }))).toEqual([
      "3",
    ]);
    expect(
      ids(filterPosts(posts, { keyword: "instituto", source: "" })),
    ).toEqual(["2"]);
  });

  it("combina fonte e palavra-chave", () => {
    expect(
      filterPosts(posts, { keyword: "orçamento", source: "youtube" }),
    ).toEqual([]);
  });
});

describe("formatPostDate", () => {
  it("converte o timestamp em segundos para data em português", () => {
    expect(formatPostDate(Date.UTC(2026, 8, 20, 12) / 1000)).toBe(
      "20 de set. de 2026",
    );
  });

  it("retorna null sem data", () => {
    expect(formatPostDate(undefined)).toBeNull();
    expect(formatPostDate(0)).toBeNull();
  });
});

describe("snippetRepeatsTitle", () => {
  it("detecta quando o título é o começo do trecho", () => {
    expect(
      snippetRepeatsTitle(
        post({ title: "Grande dia", body_snippet: "Grande dia para todos" }),
      ),
    ).toBe(true);
  });

  it("mantém o título quando ele é diferente do trecho", () => {
    expect(
      snippetRepeatsTitle(post({ title: "Resumo", body_snippet: "Texto" })),
    ).toBe(false);
    expect(snippetRepeatsTitle(post({ title: " ", body_snippet: "x" }))).toBe(
      false,
    );
  });
});

describe("decodeHtmlEntities", () => {
  it("converte as entidades HTML mais comuns", () => {
    expect(
      decodeHtmlEntities(
        "Português &amp; English &quot;IC&quot; &#39;x&#39; &lt;b&gt;",
      ),
    ).toBe(`Português & English "IC" 'x' <b>`);
  });

  it("mantém o texto sem entidades", () => {
    expect(decodeHtmlEntities("Sem entidades & tal")).toBe(
      "Sem entidades & tal",
    );
  });
});
