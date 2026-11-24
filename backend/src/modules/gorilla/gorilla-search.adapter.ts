import type {
  GorillaSearchInitResponse,
  GorillaSearchStatusResponse,
  SocialSearchResults,
} from "./gorilla.types.js";
import type { SocialSearchProvider } from "./social-search.provider.js";

export const GORILLA_SEARCH_URL = "https://usegorilla.app/v1/v2-search-stream";

/** Sem um User-Agent de navegador, o Cloudflare da API pode recusar a requisição (erro 1010). */
export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

/** Parâmetros da busca: últimos 90 dias, até 50 conversas, ordenadas por relevância. */
export const SEARCH_PARAMETERS = {
  since: "90d",
  limit: 50,
  mode: "ranked",
} as const;

export interface GorillaSearchAdapterOptions {
  apiKey?: string;
  fetchFn?: typeof fetch;
  pollIntervalMs?: number;
  maxPollAttempts?: number;
}

/** Adapta a API de busca do Gorilla à interface SocialSearchProvider. */
export class GorillaSearchAdapter implements SocialSearchProvider {
  constructor(private readonly options: GorillaSearchAdapterOptions = {}) {}

  async search(query: string): Promise<SocialSearchResults> {
    const apiKey = this.options.apiKey ?? process.env.GORILLA_API_KEY;

    if (!apiKey) {
      throw new Error("GORILLA_API_KEY não foi configurada no ambiente.");
    }

    const searchId = await this.startSearch(query, apiKey);
    const status = await this.waitForCompletion(searchId, apiKey);

    return {
      search_id: status.search_id ?? searchId,
      status: status.status,
      query,
      ...(status.total === undefined ? {} : { total: status.total }),
      results: status.results ?? [],
    };
  }

  private async startSearch(query: string, apiKey: string): Promise<string> {
    const fetchFn = this.options.fetchFn ?? fetch;
    const response = await fetchFn(GORILLA_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": BROWSER_USER_AGENT,
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ query, ...SEARCH_PARAMETERS }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Falha no POST do Gorilla (${response.status}): ${errorText}`,
      );
    }

    const { search_id } = (await response.json()) as GorillaSearchInitResponse;
    return search_id;
  }

  private async waitForCompletion(
    searchId: string,
    apiKey: string,
  ): Promise<GorillaSearchStatusResponse> {
    const fetchFn = this.options.fetchFn ?? fetch;
    const intervalMs = this.options.pollIntervalMs ?? 2000;
    // Buscas grandes levam de 60 a 160 segundos: 90 consultas a cada 2 s cobrem 3 minutos.
    const maxAttempts = this.options.maxPollAttempts ?? 90;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (intervalMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      const response = await fetchFn(`${GORILLA_SEARCH_URL}?id=${searchId}`, {
        headers: { "User-Agent": BROWSER_USER_AGENT, "x-api-key": apiKey },
      });

      if (!response.ok) {
        throw new Error(`Erro no polling: ${response.statusText}`);
      }

      const status = (await response.json()) as GorillaSearchStatusResponse;

      if (status.status === "completed") {
        return status;
      }
    }

    throw new Error(
      `A busca no Gorilla não terminou após ${maxAttempts} consultas de estado.`,
    );
  }
}
