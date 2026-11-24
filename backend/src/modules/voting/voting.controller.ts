import type { Request, Response } from "express";

import {
  InMemoryProposalCatalog,
  type ProposalCatalog,
  type VotingProposalSummary,
} from "./voting.proposals.js";
import { parseCastVoteInput } from "./voting.schema.js";
import { DuplicateVoteError, VotingService } from "./voting.service.js";

type ProposalRequest = Request<{ proposalId: string }>;

const PROPOSAL_NOT_FOUND = "Pauta não encontrada.";

export class VotingController {
  constructor(
    private readonly service: VotingService,
    private readonly catalog: ProposalCatalog = new InMemoryProposalCatalog(),
  ) {}

  /** Lista as pautas com a apuração e, se `voterId` for informado, o voto dele. */
  listProposals = (req: Request, res: Response): void => {
    const voterId =
      typeof req.query.voterId === "string" ? req.query.voterId.trim() : "";

    const proposals: VotingProposalSummary[] = this.catalog
      .list()
      .map((proposal) => ({
        ...proposal,
        result: this.service.getResult(proposal.id),
        myVote: voterId
          ? this.service.findVoteOption(proposal.id, voterId)
          : null,
      }));

    res.status(200).json(proposals);
  };

  castVote = (req: ProposalRequest, res: Response): void => {
    if (!this.catalog.find(req.params.proposalId)) {
      res.status(404).json({ error: PROPOSAL_NOT_FOUND });
      return;
    }

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
    if (!this.catalog.find(req.params.proposalId)) {
      res.status(404).json({ error: PROPOSAL_NOT_FOUND });
      return;
    }

    res.status(200).json(this.service.getResult(req.params.proposalId));
  };
}
