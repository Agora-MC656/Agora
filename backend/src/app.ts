import express from "express";

import authRouter from "./modules/auth/routes.js";
import { budgetProposalRouter } from "./modules/budget-proposal-extractor/index.js";
import { gorillaRouter } from "./modules/gorilla/index.js";
import { createAgendaRouter } from "./modules/agenda.js";
import { votingRouter } from "./modules/voting/index.js";

export const app = express();

app.use(express.json());
app.use("/auth", authRouter);
app.use("/budget-proposals", budgetProposalRouter);
app.use("/api/agenda", createAgendaRouter());
app.use("/voting", votingRouter);
app.use("/api/gorilla", gorillaRouter);
