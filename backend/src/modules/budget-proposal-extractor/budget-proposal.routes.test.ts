import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { UnsupportedIcBudgetProposalYearError } from "./budget-proposal.errors.js";
import { createBudgetProposalRouter } from "./budget-proposal.routes.js";
import type { BudgetProposalService } from "./budget-proposal.service.js";
import type { BudgetProposal } from "./ic-budget-proposal.types.js";

function createTestApp(
  service: Pick<BudgetProposalService, "getIcBudgetProposal">,
) {
  const app = express();
  app.use("/budget-proposals", createBudgetProposalRouter(service));
  return app;
}

describe("budget proposal routes", () => {
  it("returns an IC budget proposal", async () => {
    const proposal: BudgetProposal = {
      institution: "Instituto de Computação da Unicamp",
      year: 2020,
      documentType: "budget_proposal",
      sourceUrl: "https://ic.unicamp.br/proposta-2020.pdf",
      extractedAt: new Date("2026-09-21T12:00:00.000Z"),
      items: [],
    };
    const service = {
      getIcBudgetProposal: () => Promise.resolve(proposal),
    };
    const app = createTestApp(service);

    const response = await request(app).get("/budget-proposals/ic/2020");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      institution: "Instituto de Computação da Unicamp",
      year: 2020,
      documentType: "budget_proposal",
      sourceUrl: "https://ic.unicamp.br/proposta-2020.pdf",
      extractedAt: "2026-09-21T12:00:00.000Z",
      items: [],
    });
  });

  it("returns 400 when the year is invalid", async () => {
    const service = {
      getIcBudgetProposal: () =>
        Promise.reject(new Error("The service must not be called.")),
    };
    const app = createTestApp(service);

    const response = await request(app).get("/budget-proposals/ic/not-a-year");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid budget proposal year: not-a-year.",
    });
  });

  it("returns 404 when the year is not supported", async () => {
    const service = {
      getIcBudgetProposal: (year: number) =>
        Promise.reject(new UnsupportedIcBudgetProposalYearError(year)),
    };
    const app = createTestApp(service);

    const response = await request(app).get("/budget-proposals/ic/2021");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Unsupported IC budget proposal year: 2021.",
    });
  });
});
