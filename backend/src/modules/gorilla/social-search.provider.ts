import type { SocialSearchResults } from "./gorilla.types.js";

/**
 * Fornecedor de busca em rede. O núcleo do Ágora depende apenas desta
 * interface; cada fornecedor externo é integrado por um adaptador.
 */
export interface SocialSearchProvider {
  search(query: string): Promise<SocialSearchResults>;
}
