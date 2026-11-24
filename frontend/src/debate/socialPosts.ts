import type { SocialPost } from "../services/api";

export type PostFilter = {
  keyword: string;
  source: string;
};

const SOURCE_LABELS: Readonly<Record<string, string>> = {
  bluesky: "Bluesky",
  linkedin: "LinkedIn",
  reddit: "Reddit",
  twitter: "X (Twitter)",
  youtube: "YouTube",
};

const HTML_ENTITIES: Readonly<Record<string, string>> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

/** Algumas fontes (como o YouTube) devolvem títulos com entidades HTML escapadas. */
export function decodeHtmlEntities(text: string): string {
  return text.replace(
    /&(?:amp|quot|#39|lt|gt);/g,
    (entity) => HTML_ENTITIES[entity] ?? entity,
  );
}

export function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

/** Fontes presentes nos resultados, com a quantidade de publicações de cada uma. */
export function countBySource(
  posts: readonly SocialPost[],
): Array<{ source: string; count: number }> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.source, (counts.get(post.source) ?? 0) + 1);
  }
  return [...counts]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));
}

/**
 * Filtra por fonte (vazio = todas) e por palavra-chave no título, no trecho,
 * no autor ou no canal, sem diferenciar maiúsculas nem acentos.
 */
export function filterPosts(
  posts: readonly SocialPost[],
  { keyword, source }: PostFilter,
): SocialPost[] {
  const term = normalize(keyword.trim());
  return posts.filter((post) => {
    if (source && post.source !== source) {
      return false;
    }
    if (!term) {
      return true;
    }
    return normalize(
      [post.title, post.body_snippet, post.author, post.channel ?? ""].join(
        " ",
      ),
    ).includes(term);
  });
}

/** Data da publicação a partir do timestamp Unix em segundos. */
export function formatPostDate(createdUtc: number | undefined): string | null {
  if (!createdUtc) {
    return null;
  }
  return new Date(createdUtc * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** O título do Gorilla costuma ser o começo do trecho; nesse caso, mostra só o trecho. */
export function snippetRepeatsTitle(post: SocialPost): boolean {
  const title = post.title.trim();
  return title.length > 0 && post.body_snippet.trim().startsWith(title);
}
