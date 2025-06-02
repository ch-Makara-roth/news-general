
import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { COUNTRIES } from '@/constants';
import HomePageClientContent from '@/components/page/HomePageClientContent';
import { getTopHeadlines } from '@/actions/newsActions';
import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton';

export async function generateMetadata(
  { searchParams }: { searchParams: { [key: string]: string | string[] | undefined } },
  parent: ResolvingMetadata // parent can be used if we need to merge with parent metadata, but for images, we'll define the primary one here.
): Promise<Metadata> {
  const countryCode = searchParams?.country as string || COUNTRIES[0].code;
  const country = COUNTRIES.find(c => c.code === countryCode);
  const countryName = country ? country.name : "Worldwide";

  let pageTitle = `Top Headlines from ${countryName} - NewsFlash`;
  let pageDescription = `Discover the latest top news headlines from ${countryName}. Stay informed with NewsFlash.`;
  
  // Default to your site's static OG image, relative to metadataBase
  // Assumes /public/og-image.png exists
  let finalOgImageUrl: string | URL = '/og-image.png'; 
  let finalOgImageAlt = pageTitle; // Default alt text

  const canonicalPath = countryCode === COUNTRIES[0].code ? '/' : `/?country=${countryCode}`;

  try {
    // Fetch only one article for metadata purposes to keep it light
    const newsResponse = await getTopHeadlines(countryCode, 1, 1); 
    if (newsResponse.status === 'ok' && newsResponse.articles && newsResponse.articles.length > 0) {
      const firstArticle = newsResponse.articles[0];
      pageDescription = `Top stories from ${countryName} including "${firstArticle.title}". Get your daily news fix with NewsFlash.`;
      if (firstArticle.urlToImage) {
        finalOgImageUrl = firstArticle.urlToImage; // Use API image if available
        finalOgImageAlt = firstArticle.title || pageTitle; // Use article title or page title as alt
      }
    }
  } catch (error) {
    console.error(`Error fetching headlines for ${countryName} (homepage metadata):`, error);
    // Fallback to default finalOgImageUrl and finalOgImageAlt is already set
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
      images: [ // Define a single, primary image object for this page
        {
          url: finalOgImageUrl, // This will be the API image URL or '/og-image.png'
          width: 1200,
          height: 630,
          alt: finalOgImageAlt,
        },
      ],
      // siteName and type are usually inherited from the root layout if defined there
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [finalOgImageUrl.toString()], // Twitter image URL must be a string
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
