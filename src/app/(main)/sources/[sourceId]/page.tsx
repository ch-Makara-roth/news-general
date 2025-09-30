
import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { SOURCES } from '@/constants';
import SourcePageClientContent from '@/components/page/SourcePageClientContent';
import { getSourceNews } from '@/actions/newsActions';
import SourcePageSkeleton from '@/components/skeletons/SourcePageSkeleton';

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
  let keywords = [sourceName.toLowerCase(), 'news', 'articles', sourceId];
  let ogImageUrl: string | null = null;
  const canonicalUrl = `/sources/${sourceId}`;

  try {
    const newsResponse = await getSourceNews(sourceId, 1, 1);
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

export default function SourcePage({ params }: { params: { sourceId: string } }) {
  const { sourceId } = params;

  return (
    <Suspense fallback={<SourcePageSkeleton />}>
      <SourcePageClientContent sourceId={sourceId} />
    </Suspense>
  );
}
