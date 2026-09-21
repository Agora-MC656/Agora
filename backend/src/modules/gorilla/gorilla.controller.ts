import type { Request, Response } from "express";

import { GorillaService } from "./gorilla.service.js";

export class GorillaController {
  constructor(private service: GorillaService = new GorillaService()) {}

  /**
   * GET /api/gorilla -> Lê os resultados locais salvos
   */
  getResults = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getStoredResults();
      res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao obter dados do Gorilla:", error);
      res.status(500).json({
        error: "Não foi possível carregar os dados locais do Gorilla.",
      });
    }
  };

  /**
   * POST /api/gorilla/fetch -> Dispara a busca real na API do Gorilla, faz polling e salva no JSON
   */
  fetchAndSave = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as Record<string, unknown> | undefined;
      const queryFromParam =
        typeof req.query.query === "string" ? req.query.query : undefined;
      const queryFromBody =
        typeof body?.query === "string" ? body.query : undefined;
      const query = queryFromParam ?? queryFromBody;
      const data = await this.service.fetchAndSave(query);
      res.status(200).json(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao disparar busca no Gorilla:", error);
      res.status(500).json({ error: message });
    }
  };
}
