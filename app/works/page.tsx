// app/works/page.tsx
import Link from "next/link";
import { client } from "../sanity.client";
import { urlFor } from "../sanity.image";
import { FaArrowRight, FaSearch } from "react-icons/fa";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "كافة الأعمال | أصوات البرج",
  description: "تصفح القائمة الكاملة للروايات المترجمة في مكتبة أصوات البرج.",
  alternates: { canonical: "https://tower-voices-pdf.vercel.app/works" }
};

async function getAllWorks() {
  /**
   * شرح التعديل:
   * 1. الترتيب حسب priority ثم التاريخ لضمان تناسق الترتيب مع الصفحة الرئيسية.
   * 2. إضافة { next: { revalidate: 60 } } لضمان تحديث الروابط (Slugs) كل دقيقة.
   */
  const query = `*[_type == "work"] | order(priority asc, _createdAt desc) {
    title,
    "slug": slug.current,
    cover,
    status,
    tags,
    priority
  }`;
  
  return await client.fetch(query, {}, { next: { revalidate: 60 } });
}

export default async function AllWorksPage() {
  const works = await getAllWorks();

  return (
    <main dir="rtl" className="bg-[#050505] min-h-screen text-gray-200 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* رأس الصفحة */}
        <div className="mb-16 border-b border-white/5 pb-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">مكتبة الأعمال</h1>
          <p className="text-gray-500 text-lg">استعرض جميع الروايات المترجمة المتاحة في أرشيفنا ({works.length} عمل)</p>
        </div>

        {/* شبكة الأعمال الكاملة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {works.map((work: any) => (
            <Link
              key={work.slug}
              href={`/works/${work.slug}`}
              className="group bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden transition-all hover:border-blue-500/40"
            >
              <div className="aspect-[2/3] relative overflow-hidden">
                <img 
                  src={urlFor(work.cover).width(500).url()} 
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-[10px] px-3 py-1 rounded-full border border-white/10 text-white">
                  {work.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {work.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}