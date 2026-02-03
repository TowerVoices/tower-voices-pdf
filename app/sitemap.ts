import { MetadataRoute } from 'next';
import { client } from './sanity.client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // التحديث النهائي للنطاق الرسمي الجديد
  const baseUrl = "https://towervoices.online"; 

  // جلب كل الروابط (slugs) لـ 16 عملاً مع ضمان التحديث التلقائي
  const query = `*[_type == "work"]{ "slug": slug.current, _updatedAt }`;
  const works = await client.fetch(query, {}, { next: { revalidate: 60 } });

  const workUrls = works.map((work: any) => ({
    url: `${baseUrl}/works/${work.slug}`,
    lastModified: work._updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl, // الواجهة الرئيسية للنطاق الجديد
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/works`, // صفحة المكتبة الشاملة
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...workUrls,
  ];
}