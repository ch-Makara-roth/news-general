
import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { COUNTRIES } from '@/constants';
import HomePageClientContent from '@/components/page/HomePageClientContent';
import { getTopHeadlines } from '@/actions/newsActions';
import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton';

export async function generateMetadata(
  { searchParams = {} }: { searchParams?: { [key: string]: string | string[] | undefined } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const countryParam = searchParams.country;
  const countryCode = (Array.isArray(countryParam) ? countryParam[0] : countryParam) || COUNTRIES[0].code;
  const country = COUNTRIES.find(c => c.code === countryCode);
  const countryName = country ? country.name : "Worldwide";

  let pageTitle = `Top Headlines from ${countryName} - NewsFlash`;
  let pageDescription = `Discover the latest top news headlines from ${countryName}. Stay informed with NewsFlash.`;
  
  let finalOgImageUrl: string | URL = '/og-image.png'; 
  let finalOgImageAlt = pageTitle; 

  const canonicalPath = countryCode === COUNTRIES[0].code ? '/' : `/?country=${countryCode}`;

  try {
    const newsResponse = await getTopHeadlines(countryCode, 1, 1); 
    if (newsResponse.status === 'ok' && newsResponse.articles && newsResponse.articles.length > 0) {
      const firstArticle = newsResponse.articles[0];
      pageDescription = `Top stories from ${countryName} including "${firstArticle.title}". Get your daily news fix with NewsFlash.`;
      if (firstArticle.urlToImage) {
        finalOgImageUrl = firstArticle.urlToImage; 
        finalOgImageAlt = firstArticle.title || pageTitle; 
      }
    }
  } catch (error) {
    console.error(`Error fetching headlines for ${countryName} (homepage metadata):`, error);
  }

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalPath,
      images: [ 
        {
          url: finalOgImageUrl, 
          width: 1200,
          height: 630,
          alt: finalOgImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [finalOgImageUrl.toString()], 
    },
  };
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClientContent />
    </Suspense>
  );
}
