import { describe, expect, it } from "vitest";

import { parseCastVoteInput } from "./voting.schema.js";

describe("parseCastVoteInput", () => {
  it("aceita um voto valido e remove espacos do voterId", () => {
    expect(parseCastVoteInput({ voterId: "  ana  ", option: "sim" })).toEqual({
      success: true,
      data: { voterId: "ana", option: "sim" },
    });
  });

  it.each([
    ["corpo ausente", null],
    ["corpo que nao e objeto", "sim"],
    ["voterId ausente", { option: "sim" }],
    ["voterId vazio", { voterId: "   ", option: "sim" }],
    ["option ausente", { voterId: "ana" }],
    ["option invalida", { voterId: "ana", option: "talvez" }],
  ])("rejeita %s", (_caso, payload) => {
    const parsed = parseCastVoteInput(payload);

    expect(parsed.success).toBe(false);
  });
});
