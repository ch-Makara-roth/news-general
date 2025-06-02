
import type { Metadata, ResolvingMetadata } from 'next';
import { COUNTRIES } from '@/constants';
import HomePageClientContent from '@/components/page/HomePageClientContent';
import { getTopHeadlines } from '@/actions/newsActions'; // Import the action

export async function generateMetadata(
  { searchParams }: { searchParams: { [key: string]: string | string[] | undefined } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const countryCode = searchParams?.country as string || COUNTRIES[0].code;
  const country = COUNTRIES.find(c => c.code === countryCode);
  const countryName = country ? country.name : "Worldwide";

  let pageTitle = `Top Headlines from ${countryName} - NewsFlash`;
  let pageDescription = `Discover the latest top news headlines from ${countryName}. Stay informed with NewsFlash.`;
  let ogImageUrl = 'https://placehold.co/1200x630.png'; // Default OG Image
  const canonicalPath = countryCode === COUNTRIES[0].code ? '/' : `/?country=${countryCode}`;

  try {
    // Fetch 1-2 articles for metadata enhancement
    const newsResponse = await getTopHeadlines(countryCode, 1, 2);
    if (newsResponse.status === 'ok' && newsResponse.articles && newsResponse.articles.length > 0) {
      const firstArticle = newsResponse.articles[0];
      pageDescription = `Top stories from ${countryName} including "${firstArticle.title}". Get your daily news fix with NewsFlash.`;
      if (firstArticle.urlToImage) {
        ogImageUrl = firstArticle.urlToImage;
      }
    }
  } catch (error) {
    console.error(`Error fetching headlines for ${countryName} (homepage metadata):`, error);
    // Fallback to default description/image if API fails
  }

  const previousImages = (await parent).openGraph?.images || [];

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

export default function HomePage() {
  // This page is a Server Component.
  // It renders the HomePageClientContent component which handles client-side logic.
  return <HomePageClientContent />;
}
