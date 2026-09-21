import express from "express";

import { budgetProposalRouter } from "./modules/budget-proposal-extractor/index.js";
import { votingRouter } from "./modules/voting/index.js";

export const app = express();

app.use(express.json());
app.use("/budget-proposals", budgetProposalRouter);
app.use("/voting", votingRouter);
