
import type { Article, NewsApiResponse } from '@/lib/types';
import NewsCard from './NewsCard';
import NewsSkeleton from './NewsSkeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Info } from "lucide-react"; // Added Info icon
import type { MoreLikeThisModalRef } from './MoreLikeThisModal';
import Link from 'next/link'; // Added Link import

interface NewsListProps {
  response: NewsApiResponse | undefined;
  loading: boolean;
  moreLikeThisModalRef?: React.RefObject<MoreLikeThisModalRef>;
}

export default function NewsList({ response, loading, moreLikeThisModalRef }: NewsListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
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
          {response?.message || "An unexpected error occurred."} Please try again in a few moments.
          If the issue persists, you can try exploring other sections or visit our{' '}
          <Link href="/" className="font-semibold underline hover:text-destructive-foreground/80">
            homepage
          </Link> for the latest updates.
        </AlertDescription>
      </Alert>
    );
  }

  if (response.articles.length === 0) {
    return (
      <Alert className="mt-8">
        <Info className="h-4 w-4" />
        <AlertTitle>No Articles Found</AlertTitle>
        <AlertDescription>
          We couldn't find any articles matching your current selection.
          Please try a different search, category, or source. You can also check out our{' '}
          <Link href="/" className="font-semibold underline hover:text-foreground/80">
            homepage
          </Link> for the latest headlines.
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
    <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
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
