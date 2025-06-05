
import type { Article, NewsApiResponse } from '@/lib/types';
import NewsCard from './NewsCard';
import NewsSkeleton from './NewsSkeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Info, SearchCheck } from "lucide-react"; 
import type { MoreLikeThisModalRef } from './MoreLikeThisModal';
import Link from 'next/link'; 

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
        <SearchCheck className="h-4 w-4" /> {/* Changed icon */}
        <AlertTitle>No Articles Found</AlertTitle>
        <AlertDescription>
          No articles match your current selection. Why not try:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Adjusting your search terms or filters?</li>
            <li>Exploring <Link href="/categories/general" className="font-semibold underline hover:text-foreground/80">different categories</Link>?</li>
            <li>Checking the <Link href="/" className="font-semibold underline hover:text-foreground/80">latest top headlines</Link>?</li>
          </ul>
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
          isPriority={index < 2} // Prioritize the first two images
        />
      ))}
    </div>
  );
}

