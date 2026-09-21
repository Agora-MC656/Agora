import { VOTE_OPTIONS, type VoteOption } from "./voting.types.js";

export type CastVoteInput = {
  voterId: string;
  option: VoteOption;
};

export type ParseResult =
  { success: true; data: CastVoteInput } | { success: false; error: string };

function isVoteOption(value: unknown): value is VoteOption {
  return VOTE_OPTIONS.some((option) => option === value);
}

export function parseCastVoteInput(payload: unknown): ParseResult {
  if (typeof payload !== "object" || payload === null) {
    return {
      success: false,
      error: "O corpo da requisicao deve ser um objeto JSON.",
    };
  }

  const { voterId, option } = payload as Record<string, unknown>;

  if (typeof voterId !== "string" || voterId.trim() === "") {
    return {
      success: false,
      error: "O campo voterId e obrigatorio e deve ser um texto nao vazio.",
    };
  }

  if (!isVoteOption(option)) {
    return {
      success: false,
      error: `O campo option deve ser um destes valores: ${VOTE_OPTIONS.join(", ")}.`,
    };
  }

  return { success: true, data: { voterId: voterId.trim(), option } };
}
