
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
import { getTopHeadlines } from '@/actions/newsActions';
import type { NewsApiResponse } from '@/lib/types';
import NewsList from '@/components/news/NewsList';
import CountrySelector from '@/components/news/CountrySelector';
import PaginationControls from '@/components/PaginationControls';
import MoreLikeThisModal, { type MoreLikeThisModalRef } from '@/components/news/MoreLikeThisModal';
import { COUNTRIES } from '@/constants';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 12;

export default function HomePageClientContent() {
  const searchParams = useSearchParams();
  const router = useRouter(); // For programmatic navigation

  // Initialize state from searchParams or defaults
  const [selectedCountry, setSelectedCountry] = useState(() => searchParams.get('country') || COUNTRIES[0].code);
  const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get('page') || '1', 10));
  
  const [newsResponse, setNewsResponse] = useState<NewsApiResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const moreLikeThisModalRef = useRef<MoreLikeThisModalRef>(null);

  // Effect to update state if searchParams change (e.g., browser back/forward, or router.push)
  useEffect(() => {
    const newCountry = searchParams.get('country') || COUNTRIES[0].code;
    const newPage = parseInt(searchParams.get('page') || '1', 10);
    setSelectedCountry(newCountry);
    setCurrentPage(newPage);
  }, [searchParams]);
  

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await getTopHeadlines(selectedCountry, currentPage, PAGE_SIZE);
        if (response.status === 'error') {
           toast({
            title: "Error fetching news",
            description: response.message || "Could not load headlines.",
            variant: "destructive",
          });
        }
        setNewsResponse(response);
      } catch (error) {
        console.error("Failed to fetch top headlines:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setNewsResponse({ status: "error", message: `Failed to load headlines: ${errorMessage}` });
        toast({
          title: "Error",
          description: `Failed to load headlines: ${errorMessage}`,
          variant: "destructive",
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [selectedCountry, currentPage, toast]);

  const handleCountryChange = (countryCode: string) => {
    // Update URL using Next.js router, which will trigger searchParams useEffect
    const newUrl = `/?country=${countryCode}&page=1`;
    router.push(newUrl); 
  };

  const totalArticles = newsResponse?.totalResults || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-headline font-semibold mb-4 sm:mb-0">Top Headlines</h2>
        <CountrySelector selectedCountry={selectedCountry} onCountryChange={handleCountryChange} />
      </div>
      
      <NewsList response={newsResponse} loading={loading} moreLikeThisModalRef={moreLikeThisModalRef} />
      
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
