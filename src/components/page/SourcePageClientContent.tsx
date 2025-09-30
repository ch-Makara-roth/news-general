
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
import { Frown, Newspaper } from "lucide-react";
import { summarizeNews } from '@/ai/flows/summarizeContent';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const { toast } = useToast();

  const moreLikeThisModalRef = useRef<MoreLikeThisModalRef>(null);
  
  const currentSource = SOURCES.find(s => s.id === sourceId);

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      if (!sourceId || !currentSource) {
        setLoading(false);
        setSummaryLoading(false);
        return;
      }
      setLoading(true);
      setSummaryLoading(true);
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

        if (currentPage === 1 && response.status === 'ok' && response.articles && response.articles.length > 0) {
          const titles = response.articles.map(a => a.title);
          const topic = `News from ${currentSource.name}`;
          summarizeNews(topic, titles).then(setSummary);
        }

      } catch (error) {
        console.error(`Failed to fetch news from ${sourceId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setNewsResponse({ status: "error", message: `Failed to load news: ${errorMessage}` });
        toast({
          title: "Error",
          description: `Failed to load news: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setSummaryLoading(false);
      }
    }
    fetchData();
  }, [sourceId, currentPage, currentSource, toast]);


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

  return (
    <div>
      <h2 className="text-3xl font-headline font-semibold mb-4">
        News from <span className="text-primary">{currentSource?.name || "Source"}</span>
      </h2>

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
