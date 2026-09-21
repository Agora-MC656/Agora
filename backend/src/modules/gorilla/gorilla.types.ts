export interface GorillaSearchInitResponse {
  search_id: string;
  status: string;
}

export interface GorillaPost {
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

export interface GorillaSearchResults {
  search_id: string;
  status: string;
  total?: number;
  results: GorillaPost[];
}
