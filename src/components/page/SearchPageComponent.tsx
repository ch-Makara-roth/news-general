
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchNews } from '@/actions/newsActions';
import type { NewsApiResponse, Article } from '@/lib/types';
import NewsList from '@/components/news/NewsList';
import PaginationControls from '@/components/PaginationControls';
import MoreLikeThisModal, { type MoreLikeThisModalRef } from '@/components/news/MoreLikeThisModal';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchIcon as SearchIconLucide } from "lucide-react"; 
import Link from 'next/link';

const PAGE_SIZE = 12;

export default function SearchPageComponent() {
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
        // Set loading to false here, as we are not fetching
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

  if (!query && !loading) { // Show this message only if there's no query and not loading
    return (
      <div>
        <h2 className="text-3xl font-headline font-semibold mb-6 flex items-center">
          <SearchIconLucide className="w-8 h-8 mr-2 text-primary" /> Search News
        </h2>
        <Alert className="mt-8">
          <SearchIconLucide className="h-4 w-4" /> {/* Changed icon */}
          <AlertTitle>Discover News Articles</AlertTitle>
          <AlertDescription>
            Enter a keyword or topic in the search bar above to find specific news.
            Alternatively, you can <Link href="/" className="font-semibold underline hover:text-foreground/80">explore top headlines</Link> or browse by <Link href="/categories/general" className="font-semibold underline hover:text-foreground/80">popular categories</Link>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-headline font-semibold mb-6">
        Search Results {query ? <>for: <span className="text-primary">{query}</span></> : ""}
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

