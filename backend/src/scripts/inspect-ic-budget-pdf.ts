import { IcBudgetProposalExtractor } from "../modules/budget-proposal-extractor/index.js";

const extractor = new IcBudgetProposalExtractor();
const proposal = await extractor.extract(2020);

console.log(`Fonte: ${proposal.sourceUrl}`);
console.log(`Itens extraídos: ${proposal.items.length}`);
console.log(JSON.stringify(proposal, null, 2));
