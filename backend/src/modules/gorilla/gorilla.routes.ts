import { Router } from "express";

import { GorillaController } from "./gorilla.controller.js";

export const gorillaRouter = Router();
const controller = new GorillaController();

gorillaRouter.get("/", controller.getResults);
gorillaRouter.post("/fetch", controller.fetchAndSave);
