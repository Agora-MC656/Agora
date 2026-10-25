import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { GorillaSearchAdapter } from "./gorilla-search.adapter.js";
import type { SocialSearchResults } from "./gorilla.types.js";
import type { SocialSearchProvider } from "./social-search.provider.js";

const DEFAULT_QUERY = "orçamento participativo";

function resolveDefaultDataPath(): string {
  const localFixture = resolve(
    import.meta.dirname,
    "./fixtures/gorilla-sample.json",
  );
  if (existsSync(localFixture)) {
    return localFixture;
  }
  const srcFixture = resolve(
    import.meta.dirname,
    "../../../src/modules/gorilla/fixtures/gorilla-sample.json",
  );
  if (existsSync(srcFixture)) {
    return srcFixture;
  }
  return localFixture;
}

export class GorillaService {
  constructor(
    private readonly provider: SocialSearchProvider = new GorillaSearchAdapter(),
    private readonly dataPath: string = resolveDefaultDataPath(),
  ) {}

  /** Lê os resultados da última busca, salvos no arquivo JSON local. */
  async getStoredResults(customPath?: string): Promise<SocialSearchResults> {
    const content = await readFile(customPath ?? this.dataPath, "utf-8");
    return JSON.parse(content) as SocialSearchResults;
  }

  /** Executa uma busca no fornecedor configurado e salva o resultado. */
  async fetchAndSave(
    query = DEFAULT_QUERY,
    targetPath = this.dataPath,
  ): Promise<SocialSearchResults> {
    const results = await this.provider.search(query);

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, JSON.stringify(results, null, 2), "utf-8");

    return results;
  }
}
