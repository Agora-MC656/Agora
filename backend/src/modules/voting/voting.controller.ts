import type { Request, Response } from "express";

import { parseCastVoteInput } from "./voting.schema.js";
import { DuplicateVoteError, VotingService } from "./voting.service.js";

type ProposalRequest = Request<{ proposalId: string }>;

export class VotingController {
  constructor(private readonly service: VotingService) {}

  castVote = (req: ProposalRequest, res: Response): void => {
    const parsed = parseCastVoteInput(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    try {
      const vote = this.service.castVote(req.params.proposalId, parsed.data);
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof DuplicateVoteError) {
        res.status(409).json({ error: error.message });
        return;
      }

      throw error;
    }
  };

  getResult = (req: ProposalRequest, res: Response): void => {
    res.status(200).json(this.service.getResult(req.params.proposalId));
  };
}
