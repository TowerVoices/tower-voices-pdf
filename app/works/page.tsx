import { client } from "../sanity.client";
import { Metadata } from "next";
import WorksClient from "./WorksClient";

// 1. إعدادات السيو المتقدمة لتمييز المكتبة في نتائج البحث
export const metadata: Metadata = {
  title: "مكتبة الروايات المترجمة | تصفح أحدث الأعمال الحصرية", 
  description: "استكشف أرشيف أصوات البرج للروايات المترجمة. نوفر لك وصولاً سهلاً لجميع المجلدات والفصول بأسلوب عربي فصيح وتجربة قراءة فريدة.",
  keywords: [
    "مكتبة الروايات", "ترجمة روايات", "أصوات البرج", "Re:Zero IF Routes", 
    "Re:Zero EX", "روايات مترجمة بالعربية", "Tower Voices", "أرشيف الروايات"
  ],
  alternates: { 
    canonical: "https://towervoices.online/works" 
  },
  openGraph: {
    title: "مكتبة أصوات البرج - أرشيف الروايات الحصرية",
    description: "تصفح مئات الفصول والمجلدات المترجمة حصرياً لدى أصوات البرج.",
    url: "https://towervoices.online/works",
    siteName: "أصوات البرج",
    locale: "ar_SA",
    type: "website",
  },
};

async function getAllWorks() {
  const query = `*[_type == "work"] | order(priority asc, _createdAt desc) {
    title,
    "slug": slug.current,
    cover,
    status,
    tags
  }`;
  return await client.fetch(query, {}, { next: { revalidate: 60 } });
}

export default async function AllWorksPage() {
  const works = await getAllWorks();

  return (
    <main dir="rtl" className="bg-[#050505] min-h-screen text-gray-200 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* 2. رأس الصفحة - تم تغيير العنوان ليكون H1 فريداً */}
        <div className="mb-12 border-b border-white/5 pb-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 border-r-8 border-blue-600 pr-6">
            أرشيف الروايات المترجمة
          </h1>
          <p className="text-gray-500 text-lg pr-8">
            تصفح مجموعتنا الكاملة ({works.length} عمل متاح حالياً)
          </p>
        </div>

        {/* 3. مكون العميل للبحث والفلترة */}
        <WorksClient initialWorks={works} />
        
      </div>
    </main>
  );
}