import { Router } from "express";

import { VotingController } from "./voting.controller.js";
import { InMemoryVotingRepository } from "./voting.repository.js";
import { VotingService } from "./voting.service.js";

export function createVotingRouter(controller: VotingController): Router {
  const router = Router();

  router.post("/proposals/:proposalId/votes", controller.castVote);
  router.get("/proposals/:proposalId/results", controller.getResult);

  return router;
}

export const votingRouter = createVotingRouter(
  new VotingController(new VotingService(new InMemoryVotingRepository())),
);
