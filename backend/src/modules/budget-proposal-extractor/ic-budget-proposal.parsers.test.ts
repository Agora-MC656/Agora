import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { parseIcBudgetProposal2020 } from "./ic-budget-proposal.parser.js";
import {
  IC_BUDGET_PROPOSAL_PARSERS,
  icBudgetProposal2020Parser,
} from "./ic-budget-proposal.parsers.js";

const fixtureText = readFileSync(
  new URL("./fixtures/ic-budget-proposal-2020.txt", import.meta.url),
  "utf8",
);

describe("IC budget proposal parsers", () => {
  it("registers exactly one parser per year", () => {
    const years = IC_BUDGET_PROPOSAL_PARSERS.map((parser) => parser.year);

    expect(new Set(years).size).toBe(years.length);
  });

  it("delegates the 2020 layout to the 2020 parser", () => {
    expect(icBudgetProposal2020Parser.year).toBe(2020);
    expect(icBudgetProposal2020Parser.parse(fixtureText)).toEqual(
      parseIcBudgetProposal2020(fixtureText),
    );
  });
});
