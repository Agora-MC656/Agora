import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type {
  GorillaSearchInitResponse,
  GorillaSearchResults,
} from "./gorilla.types.js";

export class GorillaService {
  private defaultDataPath = resolve(
    import.meta.dirname,
    "./fixtures/gorilla-sample.json",
  );

  /**
   * 1. Lê os dados salvos localmente pelo coletor no arquivo JSON.
   */
  async getStoredResults(
    customPath?: string,
  ): Promise<GorillaSearchResults> {
    const targetPath = customPath ?? this.defaultDataPath;
    const content = await readFile(targetPath, "utf-8");
    return JSON.parse(content) as GorillaSearchResults;
  }

  /**
   * 2. Faz o fluxo completo na API do Gorilla:
   *    - POST para disparar a busca
   *    - GET (polling) até os dados estarem consolidados ('completed')
   *    - writeFile para persistir os dados no arquivo local
   */
  async fetchAndSave(
    query = "orçamento participativo",
    apiKey = process.env.GORILLA_API_KEY,
    fetchFn: typeof fetch = fetch,
    customPath?: string,
    intervalMs = 2000,
  ): Promise<GorillaSearchResults> {
    if (!apiKey) {
      throw new Error("GORILLA_API_KEY não foi configurada no ambiente.");
    }

    // 2.1 POST inicial disparando a busca
    const postResponse = await fetchFn(
      "https://usegorilla.app/v1/v2-search-stream",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          query,
          since: "30d",
          limit: 5,
        }),
      },
    );

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      throw new Error(
        `Falha no POST do Gorilla (${postResponse.status}): ${errorText}`,
      );
    }

    const { search_id } =
      (await postResponse.json()) as GorillaSearchInitResponse;

    // 2.2 Loop de Polling GET até 'completed'
    const finalData = (await this.pollSearchResults(
      search_id,
      apiKey,
      fetchFn,
      intervalMs,
    )) as GorillaSearchResults;

    // 2.3 Persistência em arquivo JSON
    const targetPath = customPath ?? this.defaultDataPath;
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, JSON.stringify(finalData, null, 2), "utf-8");

    return finalData;
  }

  /**
   * 3. Executa o polling na API do Gorilla até o status mudar para 'completed'.
   */
  async pollSearchResults(
    searchId: string,
    apiKey: string,
    fetchFn: typeof fetch = fetch,
    intervalMs = 2000,
  ): Promise<unknown> {
    while (true) {
      if (intervalMs > 0) {
        await new Promise((r) => setTimeout(r, intervalMs));
      }

      const pollResponse = await fetchFn(
        `https://usegorilla.app/v1/v2-search-stream?id=${searchId}`,
        {
          headers: {
            "x-api-key": apiKey,
          },
        },
      );

      if (!pollResponse.ok) {
        throw new Error(`Erro no polling: ${pollResponse.statusText}`);
      }

      const data = (await pollResponse.json()) as { status: string };

      if (data.status === "completed") {
        return data;
      }
    }
  }
}
