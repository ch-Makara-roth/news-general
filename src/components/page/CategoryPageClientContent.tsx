
"use client"; 

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCategoryNews } from '@/actions/newsActions';
import type { NewsApiResponse, Article } from '@/lib/types';
import NewsList from '@/components/news/NewsList';
import PaginationControls from '@/components/PaginationControls';
import { CATEGORIES } from '@/constants';
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

interface CategoryPageClientContentProps {
  category: string;
}

export default function CategoryPageClientContent({ category }: CategoryPageClientContentProps) {
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [newsResponse, setNewsResponse] = useState<NewsApiResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const { toast } = useToast();
  
  const moreLikeThisModalRef = useRef<MoreLikeThisModalRef>(null);

  const currentCategory = CATEGORIES.find(c => c.id === category);

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      if (!category || !currentCategory) {
        setLoading(false);
        setSummaryLoading(false);
        return;
      }
      setLoading(true);
      setSummaryLoading(true);
      try {
        const response = await getCategoryNews(category, "us", currentPage, PAGE_SIZE);
        if (response.status === 'error') {
           toast({
            title: `Error fetching ${currentCategory?.name || 'category'} news`,
            description: response.message || "Could not load articles for this category.",
            variant: "destructive",
          });
        }
        setNewsResponse(response);

        // Generate summary only for the first page
        if (currentPage === 1 && response.status === 'ok' && response.articles && response.articles.length > 0) {
          const titles = response.articles.map(a => a.title);
          const topic = currentCategory.name;
          summarizeNews(topic, titles).then(setSummary);
        }
      } catch (error) {
        console.error(`Failed to fetch ${category} news:`, error);
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
  }, [category, currentPage, currentCategory, toast]);

  const totalArticles = newsResponse?.totalResults || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

  if (!currentCategory && !loading) {
    return (
      <div className="mt-10">
        <Alert variant="destructive">
          <Frown className="h-4 w-4" />
          <AlertTitle>Invalid Category</AlertTitle>
          <AlertDescription>
            The category you're looking for doesn't seem to exist.
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                Perhaps try our <Link href="/" className="font-semibold underline hover:text-destructive-foreground/80">homepage</Link> for the latest news?
              </li>
              <li>
                Or explore one of our <Link href="/categories/general" className="font-semibold underline hover:text-destructive-foreground/80">popular categories</Link>.
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
        {currentCategory?.name || "Category"} News
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

      <Tabs defaultValue={category} className="mb-6">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <TabsList className="inline-flex h-auto gap-2 p-2">
            {CATEGORIES.map((cat) => (
              <Link href={`/categories/${cat.id}`} key={cat.id} passHref legacyBehavior>
                <TabsTrigger value={cat.id} className="capitalize px-3 py-1.5 text-sm">{cat.name}</TabsTrigger>
              </Link>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Tabs>
      
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
