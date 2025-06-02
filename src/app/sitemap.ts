
import type { MetadataRoute } from 'next';
import { CATEGORIES, COUNTRIES, SOURCES } from '@/constants';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsflash.example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  const categoryRoutes = CATEGORIES.map((category) => ({
    url: `${siteUrl}/categories/${category.id}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const sourceRoutes = SOURCES.map((source) => ({
    url: `${siteUrl}/sources/${source.id}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const countryRoutes = COUNTRIES.map((country) => ({
    url: `${siteUrl}/country/${country.code}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...sourceRoutes,
    ...countryRoutes,
  ];
}
