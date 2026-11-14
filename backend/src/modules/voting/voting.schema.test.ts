import { describe, expect, it } from "vitest";

import { parseCastVoteInput, type CastVoteInput } from "./voting.schema.js";

describe("parseCastVoteInput", () => {
  describe("C2-V1: objeto com identificador nao vazio e opcao sim ou nao", () => {
    it.each<readonly [string, unknown, CastVoteInput]>([
      [
        "C2-T1: normaliza espacos do voterId com opcao sim",
        { voterId: "ana ", option: "sim" },
        { voterId: "ana", option: "sim" },
      ],
      [
        "C2-T2: aceita a segunda opcao valida nao",
        { voterId: "ana", option: "nao" },
        { voterId: "ana", option: "nao" },
      ],
      [
        "remove espacos nas duas pontas do voterId",
        { voterId: "  ana  ", option: "sim" },
        { voterId: "ana", option: "sim" },
      ],
    ])("%s", (_caso, payload, expectedData) => {
      expect(parseCastVoteInput(payload)).toEqual({
        success: true,
        data: expectedData,
      });
    });
  });

  describe.each<
    readonly [
      classe: string,
      expectedError: string,
      cases: ReadonlyArray<readonly [string, unknown]>,
    ]
  >([
    [
      "C2-I1: corpo ausente ou de tipo primitivo",
      "O corpo da requisicao deve ser um objeto JSON.",
      [
        ["C2-T3: corpo null", null],
        ["C2-T3: corpo textual", "sim"],
        ["corpo ausente", undefined],
      ],
    ],
    [
      "C2-I2: voterId ausente, nao textual ou formado apenas por espacos",
      "O campo voterId e obrigatorio e deve ser um texto nao vazio.",
      [
        ["C2-T4: voterId ausente", { option: "sim" }],
        ["C2-T4: voterId numerico", { voterId: 123, option: "sim" }],
        [
          "C2-T4: voterId apenas com espacos",
          { voterId: "   ", option: "sim" },
        ],
      ],
    ],
    [
      "C2-I3: option ausente ou diferente de sim/nao",
      "O campo option deve ser um destes valores: sim, nao.",
      [
        ["C2-T5: option ausente", { voterId: "ana" }],
        ["C2-T5: option talvez", { voterId: "ana", option: "talvez" }],
      ],
    ],
  ])("%s", (_classe, expectedError, cases) => {
    it.each(cases)("rejeita %s", (_caso, payload) => {
      expect(parseCastVoteInput(payload)).toEqual({
        success: false,
        error: expectedError,
      });
    });
  });
});
