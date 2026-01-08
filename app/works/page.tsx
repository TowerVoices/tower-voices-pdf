// app/works/page.tsx
import { client } from "../sanity.client";
import { Metadata } from "next";
import WorksClient from "./WorksClient";

export const metadata: Metadata = {
  title: "كافة الأعمال | أصوات البرج",
  description: "تصفح القائمة الكاملة للروايات المترجمة في مكتبة أصوات البرج.",
  alternates: { canonical: "https://tower-voices-pdf.vercel.app/works" }
};

async function getAllWorks() {
  /**
   * جلب البيانات مع ترتيبها حسب الأولوية والتاريخ.
   * تم تفعيل Revalidate لضمان تحديث الروابط فور تغييرها.
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
        
        {/* رأس الصفحة */}
        <div className="mb-12 border-b border-white/5 pb-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">مكتبة الأعمال</h1>
          <p className="text-gray-500 text-lg">استعرض جميع الروايات المترجمة ({works.length} عمل)</p>
        </div>

        {/* استدعاء مكون العميل الذي يحتوي على البحث والفلترة */}
        <WorksClient initialWorks={works} />
        
      </div>
    </main>
  );
}