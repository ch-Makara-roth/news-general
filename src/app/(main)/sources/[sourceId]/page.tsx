
import type { Metadata, ResolvingMetadata } from 'next';
import { SOURCES } from '@/constants';
import SourcePageClientContent from '@/components/page/SourcePageClientContent'; // New client component

type SourcePageProps = {
  params: { sourceId: string };
  searchParams: { [key: string]: string | string[] | undefined }; // Kept for consistency if future server-side needs arise for searchParams
};

export async function generateMetadata(
  { params }: SourcePageProps,
  _parent: ResolvingMetadata // parent is not used, prefixed with _
): Promise<Metadata> {
  const sourceId = params.sourceId;
  const source = SOURCES.find(s => s.id === sourceId);
  const sourceName = source ? source.name : "News Source";

  const pageTitle = `News from ${sourceName}`;
  const pageDescription = `Read the latest articles and headlines from ${sourceName}. Your trusted source on NewsFlash.`;
  const ogImageUrl = 'https://placehold.co/1200x630.png';
  const canonicalUrl = `/sources/${sourceId}`;

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

// This is now the Server Component for the source page
export default function SourcePage({ params }: { params: { sourceId: string } }) {
  const { sourceId } = params; // Direct access to sourceId in Server Component

  // Render the client component, passing the sourceId
  return <SourcePageClientContent sourceId={sourceId} />;
}
