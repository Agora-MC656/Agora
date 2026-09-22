import { Router } from "express";

import { BudgetProposalController } from "./budget-proposal.controller.js";
import { InMemoryBudgetProposalRepository } from "./budget-proposal.repository.js";
import { BudgetProposalService } from "./budget-proposal.service.js";
import { IcBudgetProposalExtractor } from "./ic-budget-proposal.extractor.js";

export function createBudgetProposalRouter(
  service: Pick<BudgetProposalService, "getIcBudgetProposal">,
): Router {
  const router = Router();
  const controller = new BudgetProposalController(service);

  router.get("/ic/:year", controller.getIcBudgetProposal);

  return router;
}

const repository = new InMemoryBudgetProposalRepository();
const extractor = new IcBudgetProposalExtractor();
const service = new BudgetProposalService(repository, extractor);

export const budgetProposalRouter = createBudgetProposalRouter(service);
