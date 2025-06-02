
import { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import NewsSkeleton from '@/components/news/NewsSkeleton';
import SearchPageComponent from '@/components/page/SearchPageComponent'; // Import the new client component

type SearchPageParentProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: SearchPageParentProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const query = searchParams?.q as string || "";

  const pageTitle = query ? `Search Results for "${query}"` : "Search News";
  const pageDescription = query ? `Find news articles matching "${query}". NewsFlash helps you discover relevant information.` : "Search for news articles on NewsFlash.";
  const ogImageUrl = 'https://placehold.co/1200x630.png';
  const canonicalUrl = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
  const previousImages = (await parent).openGraph?.images || [];


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
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
         ...previousImages.filter(img => typeof img === 'string' ? img !== ogImageUrl : img.url !== ogImageUrl),
      ] : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: ogImageUrl ? [ogImageUrl] : previousImages.map(img =>  typeof img === 'string' ? img : (img.url as string)),
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
