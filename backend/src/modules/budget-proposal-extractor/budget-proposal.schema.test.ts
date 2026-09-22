import { describe, expect, it } from "vitest";

import { InvalidBudgetProposalYearError } from "./budget-proposal.errors.js";
import { parseBudgetProposalYear } from "./budget-proposal.schema.js";

describe("parseBudgetProposalYear", () => {
  it("parses a four-digit year", () => {
    expect(parseBudgetProposalYear("2020")).toBe(2020);
  });

  it.each([undefined, "", "20", "2020.5", "year"])(
    "rejects invalid year %s",
    (value) => {
      expect(() => parseBudgetProposalYear(value)).toThrow(
        InvalidBudgetProposalYearError,
      );
    },
  );
});
