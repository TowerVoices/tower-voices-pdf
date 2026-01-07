import { MetadataRoute } from 'next';
import { client } from './sanity.client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // تم تحديث الرابط هنا ليتطابق مع رابط جوجل المعتمد حالياً
  const baseUrl = "https://tower-voices-pdf.vercel.app"; 

  // جلب كل الروابط (slugs) من سانتي
  const query = `*[_type == "work"]{ "slug": slug.current, _updatedAt }`;
  const works = await client.fetch(query);

  const workUrls = works.map((work: any) => ({
    url: `${baseUrl}/works/${work.slug}`,
    lastModified: work._updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...workUrls,
  ];
}