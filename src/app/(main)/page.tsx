
import type { Metadata } from 'next';
import { COUNTRIES } from '@/constants';
import HomePageClientContent from '@/components/page/HomePageClientContent';

export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const countryCode = searchParams?.country as string || COUNTRIES[0].code;
  const country = COUNTRIES.find(c => c.code === countryCode);
  const countryName = country ? country.name : "Worldwide";

  const pageTitle = `Top Headlines from ${countryName} - NewsFlash`;
  const pageDescription = `Discover the latest top news headlines from ${countryName}. Stay informed with NewsFlash.`;
  const ogImageUrl = 'https://placehold.co/1200x630.png';

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: countryCode === COUNTRIES[0].code ? '/' : `/?country=${countryCode}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: countryCode === COUNTRIES[0].code ? '/' : `/?country=${countryCode}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImageUrl],
    },
  };
}

export default function HomePage() {
  // This page is now a Server Component.
  // It renders the HomePageClientContent component which handles client-side logic.
  return <HomePageClientContent />;
}
