import type { VoteOption, VotingResult } from "./voting.types.js";

/** Pauta aberta para a consulta consultiva da comunidade. */
export type VotingProposal = {
  id: string;
  title: string;
  description: string;
  /** Trecho da proposta orçamentária do IC que motivou a pauta. */
  budgetReference: string;
};

/** Pauta com a apuração atual e, quando informado, o voto do participante. */
export type VotingProposalSummary = VotingProposal & {
  result: VotingResult;
  myVote: VoteOption | null;
};

export type ProposalCatalog = {
  list(): VotingProposal[];
  find(proposalId: string): VotingProposal | undefined;
};

/**
 * Pautas iniciais do MVP, baseadas em itens da previsão orçamentária de 2020
 * do IC. Os valores citados são os do documento publicado pelo instituto.
 */
export const IC_PROPOSALS: readonly VotingProposal[] = [
  {
    id: "renovacao-laboratorio-ensino",
    title: "Antecipar a renovação de um laboratório de ensino",
    description:
      "Na previsão de 2020, a substituição de um laboratório de ensino (R$ 128.000,00) aparece com prioridade P4, a mais baixa. Você apoia que essa renovação passe a ter prioridade maior?",
    budgetReference: "Informática › Parque Computacional",
  },
  {
    id: "wifi-ic1-ic2",
    title: "Ampliar a rede Wi-Fi dos prédios IC1 e IC2",
    description:
      "A proposta de 2020 prevê R$ 9.600,00 para três pontos de acesso Wi-Fi no IC1 e no IC2. Você apoia ampliar esse investimento?",
    budgetReference: "Informática › Infraestrutura",
  },
  {
    id: "atividades-estudantis",
    title: "Aumentar a verba de atividades estudantis extracurriculares",
    description:
      "Em 2020, as atividades estudantis extracurriculares receberam R$ 20.000,00. Você apoia aumentar esse valor nas próximas propostas?",
    budgetReference:
      "Atividades Acadêmicas › Atividades Estudantis Extracurriculares",
  },
];

/** Catálogo em memória, substituível por um banco sem alterar o controller. */
export class InMemoryProposalCatalog implements ProposalCatalog {
  private readonly proposals: readonly VotingProposal[];

  constructor(proposals: readonly VotingProposal[] = IC_PROPOSALS) {
    this.proposals = [...proposals];
  }

  list(): VotingProposal[] {
    return [...this.proposals];
  }

  find(proposalId: string): VotingProposal | undefined {
    return this.proposals.find((proposal) => proposal.id === proposalId);
  }
}
