import { MetadataRoute } from 'next';
import { client } from './sanity.client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tower-voices-pdf.vercel.app"; 

  // جلب كل الروابط (slugs) من سانتي مع تحديث تلقائي كل 60 ثانية
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
      url: baseUrl, // الصفحة الرئيسية
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/works`, // صفحة المكتبة - ضرورية جداً لأرشفة الكلمات المفتاحية
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...workUrls,
  ];
}