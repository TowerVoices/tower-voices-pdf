// app/works/page.tsx
import { client } from "../sanity.client";
import { Metadata } from "next";
import WorksClient from "./WorksClient";

// 1. إعدادات السيو: عنوان نظيف وعام مع وصف وكلمات مفتاحية قوية تقنياً
export const metadata: Metadata = {
  title: "مكتبة الأعمال | أصوات البرج", // العنوان الذي طلبته
  description: "استعرض المكتبة الكاملة للروايات المترجمة، بما في ذلك ترجمة روايات ريزيرو (Re:Zero) بكافة مساراتها وقصصها الجانبية.",
  keywords: [
    "مكتبة الروايات", "ترجمة روايات", "أصوات البرج", "Re:Zero IF Routes", 
    "Re:Zero EX", "روايات مترجمة بالعربية", "Tower Voices"
  ],
  alternates: { 
    canonical: "https://tower-voices-pdf.vercel.app/works" 
  },
  openGraph: {
    title: "مكتبة الأعمال - أصوات البرج",
    description: "الأرشيف الكامل للروايات والقصص المترجمة باحترافية.",
    url: "https://tower-voices-pdf.vercel.app/works",
    siteName: "أصوات البرج",
    locale: "ar_SA",
    type: "website",
  },
};

async function getAllWorks() {
  /**
   * جلب البيانات مع الترتيب وتفعيل التحديث التلقائي كل 60 ثانية
   * لضمان ظهور الروايات الجديدة فور إضافتها في سانتي
   */
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
        
        {/* رأس الصفحة بصميم عصري وعنوان غير محصور */}
        <div className="mb-12 border-b border-white/5 pb-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            مكتبة الأعمال
          </h1>
          <p className="text-gray-500 text-lg">
            استعرض جميع الروايات المترجمة ({works.length} عمل متاح حالياً)
          </p>
        </div>

        {/* استدعاء مكون العميل الذي يحتوي على البحث والفلترة */}
        <WorksClient initialWorks={works} />
        
      </div>
    </main>
  );
}