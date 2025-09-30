
import { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { getTopHeadlines } from '@/actions/newsActions';
import { COUNTRIES } from '@/constants';
import CountryHeadlinesClientPage from '@/components/page/CountryHeadlinesClientPage';
import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton'; // Updated to use HomePageSkeleton

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
  let keywords = ['top headlines', countryName.toLowerCase(), 'news', countryCode];
  let ogImageUrl: string | null = null;
  const canonicalUrl = `/country/${countryCode}`;

  try {
    const newsResponse = await getTopHeadlines(countryCode, 1, 1);
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
  const openGraphImages = ogImageUrl ? [ogImageUrl] : previousImages;
  const parentKeywords = (await parent).keywords || [];

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: Array.from(new Set([...keywords, ...parentKeywords])),
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
      images: openGraphImages.map(img => typeof img === 'string' ? img : (img.url as string)),
    },
  };
}

export default function CountryHeadlinesPageWrapper({ params, searchParams }: CountryHeadlinesPageProps) {
  return (
    <Suspense fallback={<HomePageSkeleton />}> {/* Updated to use HomePageSkeleton */}
      <CountryHeadlinesClientPage />
    </Suspense>
  );
}
