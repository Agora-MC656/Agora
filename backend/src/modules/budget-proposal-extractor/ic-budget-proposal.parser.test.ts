import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  parseBrazilianCurrency,
  parseBudgetItemLine,
  parseIcBudgetProposal2020,
} from "./ic-budget-proposal.parser.js";

const fixtureUrl = new URL(
  "./fixtures/ic-budget-proposal-2020.txt",
  import.meta.url,
);

describe("parseBrazilianCurrency", () => {
  it("converts Brazilian currency to cents", () => {
    expect(parseBrazilianCurrency("R$ 195.000,00")).toBe(19_500_000);
  });

  it("ignores visual hyphens around currency", () => {
    expect(parseBrazilianCurrency("-R$ 29.700,00-")).toBe(2_970_000);
  });

  it("throws when currency does not contain a number", () => {
    expect(() => parseBrazilianCurrency("valor inválido")).toThrow(
      "Invalid Brazilian currency",
    );
  });
});

describe("parseBudgetItemLine", () => {
  it("[C3-V1] parses a regular budget item", () => {
    const line =
      "Atualização de servidores (novas soluções) R$ 195.000,00 R$ 60.000,00 Unicamp P1";

    expect(parseBudgetItemLine(line)).toEqual({
      description: "Atualização de servidores (novas soluções)",
      estimatedAmountCents: 19_500_000,
      approvedAmountCents: 6_000_000,
      fundingSource: "Unicamp",
      priority: "P1",
    });
  });

  it("[C3-V1] parses DEPI funding, P4 priority, and distinct amounts", () => {
    expect(
      parseBudgetItemLine("Aquisição de GPUs R$ 10.000,00 R$ 8.500,00 DEPI P4"),
    ).toEqual({
      description: "Aquisição de GPUs",
      estimatedAmountCents: 1_000_000,
      approvedAmountCents: 850_000,
      fundingSource: "DEPI",
      priority: "P4",
    });
  });

  it("[C3-V1] preserves cents and an approved amount of zero", () => {
    expect(
      parseBudgetItemLine("Bolsas de extensão R$ 1.500,50 R$ 0,00 Funcamp P2"),
    ).toEqual({
      description: "Bolsas de extensão",
      estimatedAmountCents: 150_050,
      approvedAmountCents: 0,
      fundingSource: "Funcamp",
      priority: "P2",
    });
  });

  it("[C3-V2] parses visual hyphens and a composite source", () => {
    const line =
      "Eletrocalhas -R$ 200.000,00 - -R$ 200.000,00 - Funcamp/Shell P1";

    expect(parseBudgetItemLine(line)).toEqual({
      description: "Eletrocalhas",
      estimatedAmountCents: 20_000_000,
      approvedAmountCents: 20_000_000,
      fundingSource: "Funcamp/Shell",
      priority: "P1",
    });
  });

  it("[C3-V2] parses a priority containing spaces", () => {
    const line =
      "Cabeamento estruturado -R$ 130.000,00 - -R$ 130.000,00 - Unicamp Bloqueio Judicial";

    expect(parseBudgetItemLine(line)).toEqual({
      description: "Cabeamento estruturado",
      estimatedAmountCents: 13_000_000,
      approvedAmountCents: 13_000_000,
      fundingSource: "Unicamp",
      priority: "Bloqueio Judicial",
    });
  });

  it("[C3-I1] ignores subtotal lines", () => {
    const line = "Subtotal -R$ 84.200,00 - -R$ 84.200,00 -";

    expect(parseBudgetItemLine(line)).toBeNull();
  });

  it("[C3-I1] ignores page markers", () => {
    expect(parseBudgetItemLine("-- 1 of 7 --")).toBeNull();
  });

  it("[C3-I1] ignores section headings", () => {
    expect(parseBudgetItemLine("INFORMÁTICA")).toBeNull();
  });

  it.each([
    [
      "an unknown funding source",
      "Aquisição de GPUs R$ 10.000,00 R$ 8.500,00 OutraFonte P4",
    ],
    [
      "an unsupported priority",
      "Aquisição de GPUs R$ 10.000,00 R$ 8.500,00 DEPI P5",
    ],
    ["a missing approved amount", "Aquisição de GPUs R$ 10.000,00 DEPI P4"],
    [
      "a malformed estimated amount",
      "Aquisição de GPUs R$ 10.000 R$ 8.500,00 DEPI P4",
    ],
  ])("[C3-I2] ignores %s", (_description, line) => {
    expect(parseBudgetItemLine(line)).toBeNull();
  });
});

describe("parseIcBudgetProposal2020", () => {
  it("parses all budget items from the proposal", () => {
    const text = readFileSync(fixtureUrl, "utf8");

    const items = parseIcBudgetProposal2020(text);

    expect(items).toHaveLength(103);
  });

  it("assigns section and subsection to the first item", () => {
    const text = readFileSync(fixtureUrl, "utf8");

    const items = parseIcBudgetProposal2020(text);

    expect(items[0]).toMatchObject({
      section: "Informática",
      subsection: "Parque Computacional",
      description:
        "Atualização de servidores (novas soluções) (3 unidades) - 2020 (1 - P1) E 2021 (2 - P2)",
      estimatedAmountCents: 19_500_000,
      approvedAmountCents: 6_000_000,
      fundingSource: "Unicamp",
      priority: "P1",
    });
  });

  it("assigns IC 4 items to the works section", () => {
    const text = readFileSync(fixtureUrl, "utf8");

    const items = parseIcBudgetProposal2020(text);
    const item = items.find(
      ({ description }) => description === "Cabeamento estruturado",
    );

    expect(item).toMatchObject({
      section: "Obras/Reformas/Serviços Especializados",
      subsection: "IC 4",
      estimatedAmountCents: 13_000_000,
      approvedAmountCents: 13_000_000,
    });
  });
});
