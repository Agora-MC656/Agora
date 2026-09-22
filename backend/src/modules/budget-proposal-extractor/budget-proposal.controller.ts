import type { NextFunction, Request, Response } from "express";

import {
  InvalidBudgetProposalYearError,
  UnsupportedIcBudgetProposalYearError,
} from "./budget-proposal.errors.js";
import { parseBudgetProposalYear } from "./budget-proposal.schema.js";
import type { BudgetProposalService } from "./budget-proposal.service.js";

export class BudgetProposalController {
  constructor(
    private readonly service: Pick<
      BudgetProposalService,
      "getIcBudgetProposal"
    >,
  ) {}

  getIcBudgetProposal = async (
    request: Request<{ year: string }>,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const year = parseBudgetProposalYear(request.params.year);
      const proposal = await this.service.getIcBudgetProposal(year);

      response.status(200).json(proposal);
    } catch (error) {
      if (error instanceof InvalidBudgetProposalYearError) {
        response.status(400).json({ error: error.message });
        return;
      }

      if (error instanceof UnsupportedIcBudgetProposalYearError) {
        response.status(404).json({ error: error.message });
        return;
      }

      next(error);
    }
  };
}
