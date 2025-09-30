
import type { MetadataRoute } from 'next';
import { CATEGORIES, COUNTRIES, SOURCES } from '@/constants';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://news-general.vercel.app').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Static pages that are always present
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Dynamically generated pages from constants
  const categoryRoutes = CATEGORIES.map((category) => ({
    url: `${baseUrl}/categories/${category.id}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const sourceRoutes = SOURCES.map((source) => ({
    url: `${baseUrl}/sources/${source.id}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const countryRoutes = COUNTRIES.map((country) => ({
    url: `${baseUrl}/country/${country.code}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Combine all routes into a single sitemap
  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...sourceRoutes,
    ...countryRoutes,
  ];
}
