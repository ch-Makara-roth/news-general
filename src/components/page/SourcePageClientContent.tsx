
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Frown } from "lucide-react";

const PAGE_SIZE = 12;

interface SourcePageClientContentProps {
  sourceId: string;
}

export default function SourcePageClientContent({ sourceId }: SourcePageClientContentProps) {
  const searchParams = useSearchParams();
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
      if (!sourceId || !currentSource) { // Check currentSource here too
        setLoading(false); // Stop loading if source is invalid
        return;
      }
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
  }, [sourceId, currentPage, currentSource, toast]); // Added currentSource to dependencies


  const totalArticles = newsResponse?.totalResults || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

  if (!currentSource && !loading) {
     return (
      <div className="mt-10">
        <Alert variant="destructive">
          <Frown className="h-4 w-4" />
          <AlertTitle>Invalid News Source</AlertTitle>
          <AlertDescription>
            The news source you're looking for doesn't seem to exist or is not supported.
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                Please check our <Link href="/" className="font-semibold underline hover:text-destructive-foreground/80">homepage</Link> for general news.
              </li>
              <li>
                Or explore news from other <Link href="/sources/bbc-news" className="font-semibold underline hover:text-destructive-foreground/80">available sources</Link>.
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render skeleton or loading state if currentSource is valid but data is still fetching
  if (loading && currentSource) {
    return <NewsList response={undefined} loading={true} />
  }

  return (
    <div>
      <h2 className="text-3xl font-headline font-semibold mb-4">
        News from <span className="text-primary">{currentSource?.name || "Source"}</span>
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
