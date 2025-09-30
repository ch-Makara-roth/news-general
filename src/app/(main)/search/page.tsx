
import { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import NewsSkeleton from '@/components/news/NewsSkeleton';
import SearchPageComponent from '@/components/page/SearchPageComponent'; // Import the new client component
import { searchNews } from '@/actions/newsActions';

type SearchPageParentProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: SearchPageParentProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const query = searchParams?.q as string || "";

  const pageTitle = query ? `Search Results for "${query}"` : "Search News";
  let pageDescription = query ? `Find news articles matching "${query}". NewsFlash helps you discover relevant information.` : "Search for news articles on NewsFlash.";
  let ogImageUrl: string | null = null;
  const canonicalUrl = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
  
  if (query) {
    try {
      const newsResponse = await searchNews(query, 1, 1);
      if (newsResponse.status === 'ok' && newsResponse.articles && newsResponse.articles.length > 0) {
        if (newsResponse.articles[0].urlToImage) {
          ogImageUrl = newsResponse.articles[0].urlToImage;
        }
      }
    } catch (error) {
      console.error(`Error fetching search results for "${query}" metadata:`, error);
    }
  }

  const previousImages = (await parent).openGraph?.images || [];
  const openGraphImages = ogImageUrl ? [ogImageUrl] : previousImages;

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
      images: openGraphImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: openGraphImages.map(img =>  typeof img === 'string' ? img : (img.url as string)),
    },
  };
}

function SearchPageSkeleton() {
  return (
    <div>
      <div className="h-8 w-3/4 bg-muted rounded mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <NewsSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageComponent />
    </Suspense>
  );
}
