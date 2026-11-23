export type UserRegistration = {
  name: string;
  email: string;
  institution: string;
  age: number;
  gender: string;
  passwordPlain: string;
};

export type LoginCredentials = {
  name_email: string;
  passwordPlain: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
};

export type BudgetProposalItem = {
  section: string;
  subsection: string | null;
  description: string;
  estimatedAmountCents: number;
  approvedAmountCents: number;
  fundingSource: string;
  priority: string;
};

export type BudgetProposal = {
  institution: string;
  year: number;
  documentType: "budget_proposal";
  sourceUrl: string;
  extractedAt: string;
  items: BudgetProposalItem[];
};

export type SocialPost = {
  id: string;
  source: string;
  channel?: string;
  title: string;
  url: string;
  author: string;
  body_snippet: string;
  score?: number;
  num_comments?: number;
  created_utc?: number;
};

export type SocialSearchResults = {
  search_id: string;
  status: string;
  total?: number;
  results: SocialPost[];
};

export type Agenda = {
  title: string;
  items: string[];
};

export type VoteOption = "sim" | "nao";

export type Vote = {
  proposalId: string;
  voterId: string;
  option: VoteOption;
};

export type VotingResult = {
  proposalId: string;
  totals: Record<VoteOption, number>;
  totalVotes: number;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("agora-auth-token");
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Não foi possível contactar o servidor. Verifique se o backend está em execução na porta 3000.",
      0,
    );
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : data && typeof data === "object" && "message" in data && typeof data.message === "string"
          ? data.message
          : response.status === 502
            ? "O servidor intermediário não conseguiu alcançar o backend. Inicie o backend e tente novamente."
            : `Erro na requisicao (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export const authApi = {
  register: (data: UserRegistration) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: LoginCredentials) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export function getIcBudgetProposal(year: number) {
  return request<BudgetProposal>(`/budget-proposals/ic/${year}`);
}

export const gorillaApi = {
  getResults: () => request<SocialSearchResults>("/api/gorilla"),
  fetchAndSave: (query?: string) =>
    request<SocialSearchResults>("/api/gorilla/fetch", {
      method: "POST",
      body: JSON.stringify(query ? { query } : {}),
    }),
};

export function generateAgenda(context: string) {
  return request<Agenda>("/api/agenda", {
    method: "POST",
    body: JSON.stringify({ context }),
  });
}

export const votingApi = {
  castVote: (proposalId: string, voterId: string, option: VoteOption) =>
    request<Vote>(`/voting/proposals/${encodeURIComponent(proposalId)}/votes`, {
      method: "POST",
      body: JSON.stringify({ voterId, option }),
    }),
  getResult: (proposalId: string) =>
    request<VotingResult>(
      `/voting/proposals/${encodeURIComponent(proposalId)}/results`,
    ),
};
