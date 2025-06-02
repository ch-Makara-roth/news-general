
import { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { getTopHeadlines } from '@/actions/newsActions';
import { COUNTRIES } from '@/constants';
import NewsSkeleton from '@/components/news/NewsSkeleton';
import CountryHeadlinesClientPage from '@/components/page/CountryHeadlinesClientPage'; // Import the new client component

type CountryHeadlinesPageProps = {
  params: { countryCode: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params: routeParams }: CountryHeadlinesPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const countryCode = routeParams.countryCode;
  const country = COUNTRIES.find(c => c.code === countryCode);
  const countryName = country ? country.name : "Selected Region";

  let pageTitle = `Top Headlines from ${countryName}`;
  let pageDescription = `Get the latest top news headlines from ${countryName}. Stay updated with NewsFlash.`;
  let ogImageUrl = 'https://placehold.co/1200x630.png';
  const canonicalUrl = `/country/${countryCode}`;

  try {
    const newsResponse = await getTopHeadlines(countryCode, 1, 2); 
    if (newsResponse.status === 'ok' && newsResponse.articles && newsResponse.articles.length > 0) {
      const firstArticle = newsResponse.articles[0];
      pageDescription = `Breaking news from ${countryName}: "${firstArticle.title}" and more top stories on NewsFlash.`;
      if (firstArticle.urlToImage) {
        ogImageUrl = firstArticle.urlToImage;
      }
    }
  } catch (error) {
    console.error(`Error fetching headlines for ${countryName} metadata:`, error);
  }
  
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
        ...previousImages.filter(img => img.url !== ogImageUrl),
      ] : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: ogImageUrl ? [ogImageUrl] : previousImages.map(img => img.url as string),
    },
  };
}

// This is the Page Server Component
export default function CountryHeadlinesPageWrapper({ params, searchParams }: CountryHeadlinesPageProps) {
  return (
    <Suspense fallback={<NewsSkeleton />}>
      <CountryHeadlinesClientPage />
    </Suspense>
  );
}
