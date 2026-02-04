import { MetadataRoute } from 'next';
import { client } from './sanity.client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // النطاق الرسمي الموثق في Search Console
  const baseUrl = "https://towervoices.online";

  // جلب الروابط الحالية لضمان استمرار أرشفة الـ 17 صفحة المكتشفة
  const query = `*[_type == "work"]{ "slug": slug.current, _updatedAt }`;
  const works = await client.fetch(query, {}, { next: { revalidate: 60 } });

  const workUrls = works.map((work: any) => ({
    url: `${baseUrl}/works/${work.slug}`,
    lastModified: work._updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/works`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // إضافة صفحة خريطة التسلسل لتعزيز ظهورها في نتائج البحث
    {
      url: `${baseUrl}/timeline`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...workUrls,
  ];
}