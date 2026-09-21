import express from "express";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { votingRouter } from "./modules/voting/index.js";

export const app = express();

// 1. Middleware básico para permitir requisições do frontend (CORS)
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  next();
});

app.use(express.json());
app.use("/voting", votingRouter);

// 2. Nosso novo endpoint da POC do Gorilla
app.get("/api/gorilla", async (_req, res) => {
  try {
    // Caminho relativo a partir de backend/src até backend/data
    const filePath = resolve(import.meta.dirname, "../data/gorilla-sample.json");
    const fileContent = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    // Retorna os dados como JSON com status 200 (OK)
    res.json(data);
  } catch (error) {
    console.error("Erro ao ler dados do Gorilla:", error);
    res.status(500).json({ error: "Não foi possível carregar os dados locais do Gorilla." });
  }
});
