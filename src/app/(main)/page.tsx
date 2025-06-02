// Using 'use client' for interactive elements like CountrySelector and AI modal trigger
"use client"; 
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTopHeadlines } from '@/actions/newsActions';
import type { NewsApiResponse, Article } from '@/lib/types';
import NewsList from '@/components/news/NewsList';
import CountrySelector from '@/components/news/CountrySelector';
import PaginationControls from '@/components/PaginationControls';
import MoreLikeThisModal, { type MoreLikeThisModalRef } from '@/components/news/MoreLikeThisModal';
import { COUNTRIES } from '@/constants';
import { useToast } from '@/hooks/use-toast';


const PAGE_SIZE = 12;

export default function HomePage() {
  const searchParams = useSearchParams();
  const initialCountry = searchParams.get('country') || COUNTRIES[0].code;
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [newsResponse, setNewsResponse] = useState<NewsApiResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const moreLikeThisModalRef = useRef<MoreLikeThisModalRef>(null);

  useEffect(() => {
    setSelectedCountry(searchParams.get('country') || COUNTRIES[0].code);
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
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
    setSelectedCountry(countryCode);
    setCurrentPage(1); // Reset to first page on country change
    // Update URL without full page reload (optional, Next.js 13+ handles this better with server components)
    // For client components, you might use router.push or modify window.history
    const newUrl = `/?country=${countryCode}&page=1`;
    window.history.pushState({}, '', newUrl); 
  };

  const totalArticles = newsResponse?.totalResults || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);


  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-2">
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
