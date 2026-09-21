import express from "express";

import { votingRouter } from "./modules/voting/index.js";

export const app = express();

app.use(express.json());
app.use("/voting", votingRouter);
