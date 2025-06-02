
"use client";

import { useState, useEffect, useRef, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSourceNews } from '@/actions/newsActions';
import type { NewsApiResponse, Article } from '@/lib/types';
import NewsList from '@/components/news/NewsList';
import PaginationControls from '@/components/PaginationControls';
import { SOURCES } from '@/constants';
import MoreLikeThisModal, { type MoreLikeThisModalRef } from '@/components/news/MoreLikeThisModal';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Metadata, ResolvingMetadata } from 'next';

type SourcePageProps = {
  params: { sourceId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: SourcePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const sourceId = params.sourceId;
  const source = SOURCES.find(s => s.id === sourceId);
  const sourceName = source ? source.name : "News Source";

  const pageTitle = `News from ${sourceName}`;
  const pageDescription = `Read the latest articles and headlines from ${sourceName}. Your trusted source on NewsFlash.`;
  const ogImageUrl = 'https://placehold.co/1200x630.png';
  const canonicalUrl = `/sources/${sourceId}`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
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

// Props type defined above for generateMetadata is also used here
export default function SourcePage({ params }: SourcePageProps) {
  const searchParams = useSearchParams();
  const resolvedParams = use(params as Promise<{ sourceId: string }>); // Next.js recommendation
  const { sourceId } = resolvedParams;

  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [newsResponse, setNewsResponse] = useState<NewsApiResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const moreLikeThisModalRef = useRef<MoreLikeThisModalRef>(null);
  
  const currentSource = SOURCES.find(s => s.id === sourceId);

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      if (!sourceId) return;
      setLoading(true);
      try {
        const response = await getSourceNews(sourceId, currentPage, PAGE_SIZE);
        if (response.status === 'error') {
           toast({
            title: `Error fetching news from ${currentSource?.name || 'source'}`,
            description: response.message || "Could not load articles from this source.",
            variant: "destructive",
          });
        }
        setNewsResponse(response);
      } catch (error) {
        console.error(`Failed to fetch news from ${sourceId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setNewsResponse({ status: "error", message: `Failed to load news: ${errorMessage}` });
        toast({
          title: "Error",
          description: `Failed to load news: ${errorMessage}`,
          variant: "destructive",
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [sourceId, currentPage, currentSource?.name, toast]);


  const totalArticles = newsResponse?.totalResults || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

  if (!currentSource) {
    return <div className="text-center text-xl mt-10">Invalid source.</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-headline font-semibold mb-4">
        News from <span className="text-primary">{currentSource.name}</span>
      </h2>
      
      <Tabs defaultValue={sourceId} className="mb-6">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <TabsList className="inline-flex h-auto gap-2 p-2">
            {SOURCES.map((src) => (
              <Link href={`/sources/${src.id}`} key={src.id} passHref legacyBehavior>
                <TabsTrigger value={src.id} className="capitalize px-3 py-1.5 text-sm">{src.name}</TabsTrigger>
              </Link>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Tabs>

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
