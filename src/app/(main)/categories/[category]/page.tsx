
import type { Metadata, ResolvingMetadata } from 'next';
import { CATEGORIES } from '@/constants';
import CategoryPageClientContent from '@/components/page/CategoryPageClientContent';

// Props type for generateMetadata
type CategoryPageMetadataProps = {
  params: { category: string };
  // searchParams is not strictly needed by generateMetadata here, but kept for consistency if future needs arise
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: CategoryPageMetadataProps,
  _parent: ResolvingMetadata // parent is not used, prefixed with _
): Promise<Metadata> {
  const categoryId = params.category;
  const category = CATEGORIES.find(cat => cat.id === categoryId);
  const categoryName = category ? category.name : "News Category";

  const pageTitle = `${categoryName} News`;
  const pageDescription = `Explore the latest news articles in the ${categoryName.toLowerCase()} category. Stay informed with NewsFlash.`;
  const ogImageUrl = 'https://placehold.co/1200x630.png'; // Generic placeholder
  const canonicalUrl = `/categories/${categoryId}`;

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

// This is the Server Component for the category page
export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params; // Direct access to category in Server Component

  // Render the client component, passing the category
  return <CategoryPageClientContent category={category} />;
}
