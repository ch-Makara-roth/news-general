"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchNews } from '@/actions/newsActions';
import type { NewsApiResponse, Article } from '@/lib/types';
import NewsList from '@/components/news/NewsList';
import PaginationControls from '@/components/PaginationControls';
import MoreLikeThisModal, { type MoreLikeThisModalRef } from '@/components/news/MoreLikeThisModal';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 12;

function SearchPageComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [newsResponse, setNewsResponse] = useState<NewsApiResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const moreLikeThisModalRef = useRef<MoreLikeThisModalRef>(null);

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      if (!query) {
        setNewsResponse({ status: "ok", articles: [], totalResults: 0 });
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await searchNews(query, currentPage, PAGE_SIZE);
        if (response.status === 'error') {
           toast({
            title: `Error searching for "${query}"`,
            description: response.message || "Could not load search results.",
            variant: "destructive",
          });
        }
        setNewsResponse(response);
      } catch (error) {
        console.error(`Failed to search news for "${query}":`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setNewsResponse({ status: "error", message: `Failed to load search results: ${errorMessage}` });
         toast({
          title: "Error",
          description: `Failed to load search results: ${errorMessage}`,
          variant: "destructive",
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [query, currentPage, toast]);

  const totalArticles = newsResponse?.totalResults || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

  return (
    <div>
      <h2 className="text-3xl font-headline font-semibold mb-6">
        Search Results for: <span className="text-primary">{query}</span>
      </h2>
      
      <NewsList response={newsResponse} loading={loading} moreLikeThisModalRef={moreLikeThisModalRef}/>
      
      {!loading && newsResponse?.status === 'ok' && newsResponse.articles && newsResponse.articles.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={currentPage < totalPages}
          hasPrevPage={currentPage > 1}
        />
      )}
      <MoreLikeThisModal ref={moreLikeThisModalRef} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageComponent />
    </Suspense>
  );
}

function SearchPageSkeleton() {
  return (
    <div>
      <div className="h-8 w-3/4 bg-muted rounded mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <NewsSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
