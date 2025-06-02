
"use client"; // For using hooks like useSearchParams and client-side state

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

const PAGE_SIZE = 12;

interface CategoryPageProps {
  params: { category: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const searchParams = useSearchParams();
  const { category } = params;
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [newsResponse, setNewsResponse] = useState<NewsApiResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const moreLikeThisModalRef = useRef<MoreLikeThisModalRef>(null);

  const currentCategory = CATEGORIES.find(c => c.id === category);

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      if (!category) return;
      setLoading(true);
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
      } catch (error) {
        console.error(`Failed to fetch ${category} news:`, error);
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
  }, [category, currentPage, currentCategory?.name, toast]);

  const totalArticles = newsResponse?.totalResults || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE);

  if (!currentCategory) {
    return <div className="text-center text-xl mt-10">Invalid category.</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-headline font-semibold mb-4">
        {currentCategory.name} News
      </h2>

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
