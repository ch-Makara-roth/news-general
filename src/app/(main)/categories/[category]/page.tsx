
import type { Metadata, ResolvingMetadata } from 'next';
import { CATEGORIES }
from '@/constants';
import CategoryPageClientContent from '@/components/page/CategoryPageClientContent';
import { getCategoryNews } from '@/actions/newsActions'; // Import the action

// Props type for generateMetadata
type CategoryPageMetadataProps = {
  params: { category: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: CategoryPageMetadataProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const categoryId = params.category;
  const category = CATEGORIES.find(cat => cat.id === categoryId);
  const categoryName = category ? category.name : "News Category";

  let pageTitle = `${categoryName} News`;
  let pageDescription = `Explore the latest news articles in the ${categoryName.toLowerCase()} category. Stay informed with NewsFlash.`;
  let ogImageUrl = 'https://placehold.co/1200x630.png';
  const canonicalUrl = `/categories/${categoryId}`;

  try {
    const newsResponse = await getCategoryNews(categoryId, "us", 1, 2); // Fetch 2 articles for metadata
    if (newsResponse.status === 'ok' && newsResponse.articles && newsResponse.articles.length > 0) {
      const firstArticle = newsResponse.articles[0];
      pageDescription = `Discover the latest ${categoryName.toLowerCase()} news, including headlines like "${firstArticle.title}". Stay updated with NewsFlash.`;
      if (firstArticle.urlToImage) {
        ogImageUrl = firstArticle.urlToImage;
      }
    }
  } catch (error) {
    console.error(`Error fetching news for category ${categoryId} metadata:`, error);
    // Fallback to default description/image if API call fails
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
        ...previousImages.filter(img => img.url !== ogImageUrl), // Avoid duplicate, keep others
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

// This is the Server Component for the category page
export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params;

  return <CategoryPageClientContent category={category} />;
}
