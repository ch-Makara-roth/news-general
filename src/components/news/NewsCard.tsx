
import type { Article } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, CalendarDays, UserCircle, NewspaperIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoreLikeThisButton } from './MoreLikeThisButton'; // We'll create this next
import Image from 'next/image';

interface NewsCardProps {
  article: Article;
  onFindRelated?: (article: Article) => void;
}

export default function NewsCard({ article, onFindRelated }: NewsCardProps) {
  const publishDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-full">
      <CardHeader className="p-0">
        {article.urlToImage ? (
          <div className="relative h-48 w-full">
            <Image
              src={article.urlToImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint="news article"
              priority={false} // Lazy load by default
            />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-secondary" data-ai-hint="news placeholder">
            <NewspaperIcon className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-2 text-lg font-headline leading-tight">
          {article.title}
        </CardTitle>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-3">
          {article.description || 'No description available.'}
        </p>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <NewspaperIcon className="h-3 w-3" />
            <span>{article.source.name}</span>
          </div>
          {article.author && (
            <div className="flex items-center gap-1">
              <UserCircle className="h-3 w-3" />
              <span>{article.author}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>{publishDate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            Read More <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        {onFindRelated && (
          <MoreLikeThisButton article={article} onFindRelated={onFindRelated} />
        )}
      </CardFooter>
    </Card>
  );
}
