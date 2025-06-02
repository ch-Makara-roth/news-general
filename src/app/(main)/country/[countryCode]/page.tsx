"use client"; 

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { getTopHeadlines } from '@/actions/newsActions';
import type { NewsApiResponse, Article } from '@/lib/types';
import NewsList from '@/components/news/NewsList';
import CountrySelector from '@/components/news/CountrySelector';
import PaginationControls from '@/components/PaginationControls';
import MoreLikeThisModal, { type MoreLikeThisModalRef } from '@/components/news/MoreLikeThisModal';
import { COUNTRIES } from '@/constants';
import { useToast } from '@/hooks/use-toast';


const PAGE_SIZE = 12;

export default function CountryHeadlinesPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  
  const countryCodeFromRoute = params.countryCode as string || COUNTRIES[0].code;
  
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [selectedCountry, setSelectedCountry] = useState(countryCodeFromRoute);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [newsResponse, setNewsResponse] = useState<NewsApiResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const moreLikeThisModalRef = useRef<MoreLikeThisModalRef>(null);

  useEffect(() => {
    setSelectedCountry(countryCodeFromRoute);
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams, countryCodeFromRoute]);
  

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
    // For a dedicated country page, we'd typically navigate
    window.location.href = `/country/${countryCode}`;
  };

  const totalArticles = newsResponse?.totalResults || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

  const currentCountryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry;


  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-3xl font-headline font-semibold mb-4 sm:mb-0">Top Headlines: {currentCountryName}</h2>
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
