import { MetadataRoute } from 'next';
import { client } from './sanity.client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://towervoices.online";

  // جلب البيانات لجميع الأعمال
  const query = `*[_type == "work"]{ "slug": slug.current, _updatedAt }`;
  const works = await client.fetch(query, {}, { next: { revalidate: 60 } });

  // 1. روابط صفحات تفاصيل الأعمال (التي تظهر فيها القصة)
  const workUrls = works.map((work: any) => ({
    url: `${baseUrl}/works/${work.slug}`,
    lastModified: work._updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 2. إضافة روابط صفحات القارئ (التي أصلحنا السيو الخاص بها مؤخراً)
  const readerUrls = works.map((work: any) => ({
    url: `${baseUrl}/reader/${work.slug}`,
    lastModified: work._updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6, // أولوية أقل قليلاً من صفحة التفاصيل لتجنب التكرار
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
    {
      url: `${baseUrl}/timeline`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...workUrls,
    ...readerUrls, // دمج روابط القارئ الجديدة هنا
  ];
}