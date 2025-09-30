
"use client"; 

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { getTopHeadlines } from '@/actions/newsActions';
import type { NewsApiResponse, Article } from '@/lib/types';
import NewsList from '@/components/news/NewsList';
import CountrySelector from '@/components/news/CountrySelector';
import PaginationControls from '@/components/PaginationControls';
import MoreLikeThisModal, { type MoreLikeThisModalRef } from '@/components/news/MoreLikeThisModal';
import { COUNTRIES } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { summarizeNews } from '@/ai/flows/summarizeContent';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper } from 'lucide-react';

const PAGE_SIZE = 12;

export default function CountryHeadlinesClientPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  
  const countryCodeFromRoute = params.countryCode as string || COUNTRIES[0].code;
  
  const [selectedCountry, setSelectedCountry] = useState(() => countryCodeFromRoute);
  const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get('page') || '1', 10));
  
  const [newsResponse, setNewsResponse] = useState<NewsApiResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const { toast } = useToast();

  const moreLikeThisModalRef = useRef<MoreLikeThisModalRef>(null);

  useEffect(() => {
    const newCountry = params.countryCode as string || COUNTRIES[0].code;
    const newPage = parseInt(searchParams.get('page') || '1', 10);
    
    if (newCountry !== selectedCountry) {
        setSelectedCountry(newCountry);
    }
    if (newPage !== currentPage) {
        setCurrentPage(newPage);
    }
  }, [searchParams, params, selectedCountry, currentPage]);
  

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setSummaryLoading(true);
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

        if (currentPage === 1 && response.status === 'ok' && response.articles && response.articles.length > 0) {
          const titles = response.articles.map(a => a.title);
          const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry;
          summarizeNews(`Top Headlines in ${countryName}`, titles).then(setSummary);
        }

      } catch (error) {
        console.error("Failed to fetch top headlines:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setNewsResponse({ status: "error", message: `Failed to load headlines: ${errorMessage}` });
        toast({
          title: "Error",
          description: `Failed to load headlines: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setSummaryLoading(false);
      }
    }
    fetchData();
  }, [selectedCountry, currentPage, toast]);

  const handleCountryChange = (countryCode: string) => {
    router.push(`/country/${countryCode}?page=1`); 
  };

  const totalArticles = newsResponse?.totalResults || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

  const currentCountryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-headline font-semibold mb-4 sm:mb-0">Top Headlines: {currentCountryName}</h2>
        <CountrySelector selectedCountry={selectedCountry} onCountryChange={handleCountryChange} />
      </div>

       {currentPage === 1 && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
          {summaryLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : summary ? (
            <p className="text-sm text-muted-foreground italic">
              <Newspaper className="inline-block h-4 w-4 mr-2" />
              {summary}
            </p>
          ) : null}
        </div>
      )}
      
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
