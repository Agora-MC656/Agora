import express from "express";

import { budgetProposalRouter } from "./modules/budget-proposal-extractor/index.js";
import { createAgendaRouter } from "./modules/agenda.js";
import { votingRouter } from "./modules/voting/index.js";

export const app = express();

app.use(express.json());
app.use("/budget-proposals", budgetProposalRouter);
app.use("/api/agenda", createAgendaRouter());
app.use("/voting", votingRouter);
