/** Publicação retornada por uma busca em rede, no formato exposto pelo Ágora. */
export interface SocialPost {
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
}

/** Resultado consolidado de uma busca em rede, independente do fornecedor. */
export interface SocialSearchResults {
  search_id: string;
  status: string;
  total?: number;
  results: SocialPost[];
}

/** Resposta da API Gorilla ao iniciar uma busca. */
export interface GorillaSearchInitResponse {
  search_id: string;
  status: string;
}

/** Resposta da API Gorilla ao consultar o estado de uma busca. */
export interface GorillaSearchStatusResponse {
  search_id?: string;
  status: string;
  total?: number;
  results?: SocialPost[];
}
