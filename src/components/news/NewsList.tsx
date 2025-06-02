import type { Article, NewsApiResponse } from '@/lib/types';
import NewsCard from './NewsCard';
import NewsSkeleton from './NewsSkeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import type { MoreLikeThisModalRef } from './MoreLikeThisModal'; // Import ref type

interface NewsListProps {
  response: NewsApiResponse | undefined;
  loading: boolean;
  moreLikeThisModalRef?: React.RefObject<MoreLikeThisModalRef>; // Add this prop
}

export default function NewsList({ response, loading, moreLikeThisModalRef }: NewsListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <NewsSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (response?.status === "error" || !response?.articles) {
    return (
      <Alert variant="destructive" className="mt-8">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error Fetching News</AlertTitle>
        <AlertDescription>
          {response?.message || "An unexpected error occurred. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  if (response.articles.length === 0) {
    return (
      <Alert className="mt-8">
        <Terminal className="h-4 w-4" />
        <AlertTitle>No Articles Found</AlertTitle>
        <AlertDescription>
          There are no articles matching your current criteria. Try adjusting your search or filters.
        </AlertDescription>
      </Alert>
    );
  }
  
  const handleFindRelated = (article: Article) => {
    if (moreLikeThisModalRef?.current) {
      moreLikeThisModalRef.current.openModal(article);
    }
  };


  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {response.articles.map((article, index) => (
        <NewsCard 
          key={`${article.url}-${index}`} 
          article={article} 
          onFindRelated={moreLikeThisModalRef ? handleFindRelated : undefined}
        />
      ))}
    </div>
  );
}
