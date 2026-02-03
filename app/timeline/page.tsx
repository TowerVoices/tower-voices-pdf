import { client } from "../sanity.client"; // تم تصحيح المسار بنقطتين واحدة
import { urlFor } from "../sanity.image";  // تم تصحيح المسار بنقطتين واحدة
import Link from "next/link";
import { FaLayerGroup, FaChevronLeft } from "react-icons/fa";

// 1. جلب البيانات من Sanity
async function getTimelineWorks() {
  const query = `*[_type == "work"] | order(chronologicalOrder asc) {
    title,
    "slug": slug.current,
    "rawCover": cover,
    chronologicalOrder,
    synopsis,
    status
  }`;
  // تم ضبط الوقت ليتحدث كل 60 ثانية
  return await client.fetch(query, {}, { next: { revalidate: 60 } });
}

// 2. المكون الأساسي (هذا هو السطر الذي يحل مشكلة Vercel)
export default async function TimelinePage() {
  const works = await getTimelineWorks();

  return (
    <main dir="rtl" className="bg-[#050505] min-h-screen text-gray-200 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">خريطة التسلسل</h1>
          <p className="text-gray-500 font-bold">دليلك البصري لترتيب أحداث ريزيرو الزمني داخل البرج</p>
        </header>

        <div className="relative border-r-2 border-white/5 mr-4 pr-8 space-y-12">
          {works?.map((work: any) => (
            <div key={work.slug} className="relative group">
              {/* النقطة الزمنية المتوهجة */}
              <div className="absolute -right-[41px] top-2 w-5 h-5 rounded-full border-4 border-[#050505] bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] group-hover:scale-125 transition-all" />
              
              <Link href={`/works/${work.slug}`} className="block">
                <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-[2.5rem] hover:border-blue-500/30 hover:bg-zinc-900/50 transition-all flex flex-col md:flex-row gap-6">
                  {/* عرض الأغلفة الاحترافية التي صممتها */}
                  <div className="w-24 h-36 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                    <img src={work.rawCover ? urlFor(work.rawCover).url() : ""} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">المرحلة {work.chronologicalOrder || 0}</span>
                       <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-500">{work.status}</span>
                    </div>
                    <h2 className="text-xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">{work.title}</h2>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{work.synopsis}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}