import { MetadataRoute } from 'next';
import { client } from './sanity.client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tower-voices-pdf.vercel.app"; 

  // جلب كل الروابط (slugs) من سانتي
  const query = `*[_type == "work"]{ "slug": slug.current, _updatedAt }`;
  
  /**
   * التعديل الجوهري:
   * أضفنا { next: { revalidate: 60 } } لضمان تحديث روابط الخريطة تلقائياً 
   * كلما قمت بتغيير الـ Slug في Sanity Studio.
   */
  const works = await client.fetch(query, {}, { next: { revalidate: 60 } });

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