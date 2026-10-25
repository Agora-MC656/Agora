import type {
  GorillaSearchInitResponse,
  GorillaSearchStatusResponse,
  SocialSearchResults,
} from "./gorilla.types.js";
import type { SocialSearchProvider } from "./social-search.provider.js";

export const GORILLA_SEARCH_URL = "https://usegorilla.app/v1/v2-search-stream";

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
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ query, since: "30d", limit: 5 }),
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
    const maxAttempts = this.options.maxPollAttempts ?? 30;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (intervalMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      const response = await fetchFn(`${GORILLA_SEARCH_URL}?id=${searchId}`, {
        headers: { "x-api-key": apiKey },
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
