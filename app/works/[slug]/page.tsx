import { client } from "../../sanity.client";
import { urlFor } from "../../sanity.image";
import { notFound } from "next/navigation";
import ShareButtons from "./ShareButtons";
import SpoilerSynopsis from "./SpoilerSynopsis";
import InteractiveRating from "@/components/InteractiveRating";
import ReportButton from "@/components/ReportButton";
import { 
  FaDownload, 
  FaExclamationTriangle, 
  FaBookOpen, 
  FaShareAlt 
} from "react-icons/fa";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

async function getWork(slug: string) {
  const query = `*[_type == "work" && slug.current == $slug][0]{
    _id,
    title,
    "rawCover": cover,
    author,
    tags,
    status,
    ratingWork,
    ratingTranslation,
    ratingCount,
    synopsis,
    isSpoiler,
    warning,
    downloadUrl
  }`;
  
  return await client.fetch(query, { slug });
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const work = await getWork(slug);

  if (!work) return notFound();

  const workRating = work.ratingWork || 0; 
  const translationRating = work.ratingTranslation || 0;
  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";

  return (
    <main dir="rtl" className="bg-[#050505] text-gray-200 min-h-screen font-sans overflow-x-hidden">
      
      {/* 1. قسم الهيرو (Hero Section) */}
      <section className="relative min-h-[55vh] md:h-[65vh] w-full overflow-hidden flex items-end">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md opacity-30 transition-all duration-700"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 w-full pb-10 md:pb-16">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end w-full">
            
            {/* غلاف الرواية */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative w-40 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
                <img 
                  src={coverUrl} 
                  alt={work.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" 
                />
              </div>
            </div>

            {/* تفاصيل النص */}
            <div className="flex-1 text-center md:text-right w-full">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {work.tags?.map((tag: string, index: number) => (
                  <span key={index} className="bg-blue-600/10 text-blue-400 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-blue-600/20 backdrop-blur-md">
                    {tag}
                  </span>
                ))}
                <span className="bg-green-500/10 text-green-400 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-green-500/20 capitalize">
                  {work.status}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-6xl font-black mb-6 text-white leading-tight tracking-tight">
                {work.title}
              </h1>

              {/* نظام التقييم المزدوج (قصة + ترجمة) */}
              <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
                
                {/* تقييم القصة */}
                <div className="flex flex-col items-center md:items-start gap-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">تقييم القصة</span>
                  <div className="bg-zinc-900/50 p-2 md:p-3 rounded-xl border border-white/5 shadow-inner flex items-center gap-3">
                    {/* تمرير fieldName="ratingWork" لحفظ تقييم القصة */}
                    <InteractiveRating 
                      initialRating={workRating} 
                      workId={work._id} 
                      fieldName="ratingWork" 
                    />
                    <div className="flex items-center gap-1 border-r border-white/10 pr-3 mr-1">
                        <span className="text-yellow-500 font-black text-lg">{workRating}</span>
                        <span className="text-gray-500 text-[10px] md:text-xs font-medium">(من {work.ratingCount || 0} تقييم)</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-px h-10 bg-white/10 hidden md:block mt-6" />

                {/* جودة الترجمة */}
                <div className="flex flex-col items-center md:items-start gap-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">جودة الترجمة</span>
                  <div className="bg-zinc-900/50 p-2 md:p-3 rounded-xl border border-white/5 shadow-inner flex items-center gap-3">
                    {/* تمرير fieldName="ratingTranslation" لحفظ تقييم الترجمة */}
                    <InteractiveRating 
                      initialRating={translationRating} 
                      workId={work._id} 
                      fieldName="ratingTranslation" 
                    />
                    <span className="text-blue-400 font-black text-lg border-r border-white/10 pr-3 mr-1">{translationRating}</span>
                  </div>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                {work.downloadUrl && (
                  <a href={work.downloadUrl} target="_blank" className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 w-full sm:w-auto">
                    <FaDownload className="text-xl" /> تحميل الرواية الآن
                  </a>
                )}
                <ReportButton workTitle={work.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. قسم المحتوى السفلي */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            {work.warning && (
              <div className="bg-red-950/20 border border-red-900/30 rounded-[2rem] p-6 md:p-8 flex items-start gap-5 backdrop-blur-md">
                <div className="p-4 bg-red-600/20 rounded-2xl border border-red-500/30">
                  <FaExclamationTriangle className="text-red-500 text-2xl" />
                </div>
                <div>
                  <h3 className="text-red-500 font-black text-xl mb-2">تنويه هام:</h3>
                  <p className="text-red-100/70 leading-relaxed font-medium">{work.warning}</p>
                </div>
              </div>
            )}

            <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                    <FaBookOpen className="text-blue-500 text-xl" />
                </div>
                <h2 className="font-black text-2xl text-white">ملخص القصة</h2>
              </div>
              <div className="prose prose-invert max-w-none text-gray-300 leading-loose text-lg">
                <SpoilerSynopsis 
                  text={work.synopsis || "لا يوجد ملخص متاح حالياً."} 
                  isSpoiler={work.isSpoiler || false} 
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
                <div className="flex items-center gap-4 text-gray-400 font-bold">
                    <FaShareAlt className="text-blue-500" /> انشر العمل مع أصدقائك
                </div>
                <ShareButtons />
            </div>
          </div>

          {/* الجانب (Sidebar) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/80 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl sticky top-24">
              <h3 className="text-xl font-bold mb-8 text-white border-b border-white/5 pb-4">معلومات العمل</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <span className="text-gray-500 text-sm">حالة العمل</span>
                    <span className="text-green-400 font-bold">{work.status}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <span className="text-gray-500 text-sm">المؤلف</span>
                    <span className="text-white font-bold">{work.author || "غير معروف"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}