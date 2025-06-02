export interface ArticleSource {
  id: string | null;
  name: string;
}

export interface Article {
  source: ArticleSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsApiResponse {
  status: "ok" | "error";
  totalResults?: number;
  articles?: Article[];
  code?: string; // For errors
  message?: string; // For errors
}

export interface FetchParams {
  country?: string;
  category?: string;
  q?: string;
  sources?: string;
  page?: number;
  pageSize?: number;
}
