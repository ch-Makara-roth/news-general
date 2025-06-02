
import type { Metadata, ResolvingMetadata } from 'next';
import { SOURCES } from '@/constants';
import SourcePageClientContent from '@/components/page/SourcePageClientContent';
import { getSourceNews } from '@/actions/newsActions'; // Import the action

type SourcePageProps = {
  params: { sourceId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: SourcePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const sourceId = params.sourceId;
  const source = SOURCES.find(s => s.id === sourceId);
  const sourceName = source ? source.name : "News Source";

  let pageTitle = `News from ${sourceName}`;
  let pageDescription = `Read the latest articles and headlines from ${sourceName}. Your trusted source on NewsFlash.`;
  let ogImageUrl = 'https://placehold.co/1200x630.png';
  const canonicalUrl = `/sources/${sourceId}`;

  try {
    const newsResponse = await getSourceNews(sourceId, 1, 2); // Fetch 2 articles for metadata
    if (newsResponse.status === 'ok' && newsResponse.articles && newsResponse.articles.length > 0) {
      const firstArticle = newsResponse.articles[0];
      pageDescription = `Get the latest news from ${sourceName}, featuring articles like "${firstArticle.title}". Stay informed with NewsFlash.`;
      if (firstArticle.urlToImage) {
        ogImageUrl = firstArticle.urlToImage;
      }
    }
  } catch (error) {
    console.error(`Error fetching news for source ${sourceId} metadata:`, error);
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

export default function SourcePage({ params }: { params: { sourceId: string } }) {
  const { sourceId } = params;

  return <SourcePageClientContent sourceId={sourceId} />;
}
