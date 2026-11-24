import { describe, expect, it } from "vitest";

import { IC_PROPOSALS, InMemoryProposalCatalog } from "./voting.proposals.js";

describe("InMemoryProposalCatalog", () => {
  it("usa as pautas do IC por padrão", () => {
    const catalog = new InMemoryProposalCatalog();

    expect(catalog.list()).toEqual(IC_PROPOSALS);
    expect(catalog.find("wifi-ic1-ic2")?.title).toBe(
      "Ampliar a rede Wi-Fi dos prédios IC1 e IC2",
    );
  });

  it("retorna undefined para uma pauta inexistente", () => {
    expect(new InMemoryProposalCatalog().find("nao-existe")).toBeUndefined();
  });

  it("não permite alterar o catálogo pela lista retornada", () => {
    const catalog = new InMemoryProposalCatalog();

    catalog.list().pop();

    expect(catalog.list()).toHaveLength(IC_PROPOSALS.length);
  });

  it("tem pautas com identificadores únicos", () => {
    const ids = IC_PROPOSALS.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
