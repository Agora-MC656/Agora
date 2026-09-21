import { openai } from "@ai-sdk/openai";
import { Output, ToolLoopAgent } from "ai";
import { Router } from "express";
import { z } from "zod";

const requestSchema = z.object({
  context: z.string().trim().min(1).max(500),
});

const agendaSchema = z.object({
  title: z.string().min(1),
  items: z.array(z.string().min(1)).min(1).max(8),
});

export type Agenda = z.infer<typeof agendaSchema>;
export type AgendaGenerator = (context: string) => Promise<Agenda>;

export class MissingAiKeyError extends Error {}

export async function generateAgenda(context: string): Promise<Agenda> {
  if (!process.env.OPENAI_API_KEY) {
    throw new MissingAiKeyError("OPENAI_API_KEY não configurada.");
  }

  const agent = new ToolLoopAgent({
    model: openai("gpt-6-astra"),
    instructions:
      "Você ajuda a organizar pautas de discussão em português. Crie um título curto e de 3 a 6 itens objetivos, sem inventar fatos ou decisões já tomadas.",
    output: Output.object({ schema: agendaSchema }),
  });

  const { output } = await agent.generate({ prompt: context });
  return output;
}

export function createAgendaRouter(
  generator: AgendaGenerator = generateAgenda,
): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    const parsed = requestSchema.safeParse(req.body);

    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Informe um contexto de até 500 caracteres." });
      return;
    }

    try {
      const agenda = await generator(parsed.data.context);
      res.json(agenda);
    } catch (error) {
      if (error instanceof MissingAiKeyError) {
        res.status(503).json({ error: error.message });
        return;
      }

      res.status(502).json({ error: "Não foi possível gerar a pauta." });
    }
  });

  return router;
}
