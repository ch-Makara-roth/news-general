
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
import type { Metadata } from 'next';

// generateMetadata can be defined in a client component's page.tsx file
// It will run on the server.
export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const countryCode = searchParams?.country as string || COUNTRIES[0].code;
  const country = COUNTRIES.find(c => c.code === countryCode);
  const countryName = country ? country.name : "Worldwide";

  const pageTitle = `Top Headlines from ${countryName} - NewsFlash`;
  const pageDescription = `Discover the latest top news headlines from ${countryName}. Stay informed with NewsFlash.`;
  const ogImageUrl = 'https://placehold.co/1200x630.png';

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: countryCode === COUNTRIES[0].code ? '/' : `/?country=${countryCode}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: countryCode === COUNTRIES[0].code ? '/' : `/?country=${countryCode}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImageUrl],
    },
  };
}


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
    const newUrl = `/?country=${countryCode}&page=1`;
    window.history.pushState({}, '', newUrl); 
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
