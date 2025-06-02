"use server";

import type { NewsApiResponse, FetchParams } from "@/lib/types";
import { API_KEY, NEWS_API_BASE_URL } from "@/constants";
import { unstable_noStore as noStore } from 'next/cache';

async function fetchNews(endpoint: string, params: Record<string, string | number>): Promise<NewsApiResponse> {
  noStore(); // Opt out of caching for dynamic data
  const queryParams = new URLSearchParams({
    apiKey: API_KEY,
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
  });

  const url = `${NEWS_API_BASE_URL}/${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`NewsAPI Error (${response.status}) for ${url}:`, errorData.message || response.statusText);
      return {
        status: "error",
        code: errorData.code || String(response.status),
        message: errorData.message || `An error occurred: ${response.statusText}`,
      };
    }

    const data: NewsApiResponse = await response.json();
    if (data.status === "error") {
       console.error(`NewsAPI Error in response for ${url}:`, data.message);
    }
    return data;

  } catch (error) {
    console.error("Network or parsing error fetching news:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unknown network error occurred",
    };
  }
}

export async function getTopHeadlines(
  country: string = "us",
  page: number = 1,
  pageSize: number = 12
): Promise<NewsApiResponse> {
  return fetchNews("top-headlines", { country, page, pageSize });
}

export async function getCategoryNews(
  category: string,
  country: string = "us",
  page: number = 1,
  pageSize: number = 12
): Promise<NewsApiResponse> {
  return fetchNews("top-headlines", { category, country, page, pageSize });
}

export async function searchNews(
  query: string,
  page: number = 1,
  pageSize: number = 12
): Promise<NewsApiResponse> {
  if (!query) {
    return { status: "error", message: "Search query cannot be empty." };
  }
  return fetchNews("everything", { q: query, sortBy: "popularity", page, pageSize });
}

export async function getSourceNews(
  sources: string,
  page: number = 1,
  pageSize: number = 12
): Promise<NewsApiResponse> {
  return fetchNews("top-headlines", { sources, page, pageSize });
}

// Mock AI flow import
import { findRelatedKeywords as findRelatedKeywordsFlow } from '@/ai/flows/relatedContent';

export async function getAIRelatedArticles(articleTitle: string, articleContent: string | null, currentArticleUrl: string): Promise<NewsApiResponse> {
  noStore();
  try {
    const keywords = await findRelatedKeywordsFlow(articleTitle, articleContent);
    if (!keywords || keywords.length === 0) {
      return { status: "ok", articles: [], totalResults: 0 };
    }

    // Fetch articles for the first keyword, ensuring we get diverse results
    // and filter out the current article.
    const query = keywords.join(" OR "); // Combine keywords for broader search
    const searchResult = await fetchNews("everything", { q: query, sortBy: "relevancy", pageSize: 6 }); // Fetch 6, filter later

    if (searchResult.status === "ok" && searchResult.articles) {
      // Filter out the current article and limit to 5
      searchResult.articles = searchResult.articles
        .filter(article => article.url !== currentArticleUrl)
        .slice(0, 5);
      searchResult.totalResults = searchResult.articles.length;
    }
    
    return searchResult;

  } catch (error) {
    console.error("AI related content fetch error:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to fetch AI related articles",
    };
  }
}
