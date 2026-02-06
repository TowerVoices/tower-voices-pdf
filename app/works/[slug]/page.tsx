import { client } from "../../sanity.client";
import { urlFor } from "../../sanity.image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import SpoilerSynopsis from "./SpoilerSynopsis";
import InteractiveRating from "@/components/InteractiveRating";
import ReportButton from "@/components/ReportButton";
import CommentForm from "@/components/CommentForm";
import ReaderButton from "./ReaderButton";

import {
  FaDownload,
  FaBookOpen,
  FaComments,
  FaInfoCircle,
  FaChevronLeft,
  FaLayerGroup,
  FaClock,
  FaStar,
  FaLanguage
} from "react-icons/fa";

interface Props {
  params: Promise<{ slug: string }>;
}

const baseUrl = "https://towervoices.online";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) return { title: "العمل غير موجود" };
  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";
  const description = work.synopsis?.slice(0, 160) || "استكشف ترجمة رواية ريزيرو الحصرية على منصة أصوات البرج.";

  return {
    title: work.title,
    description: description,
    keywords: [
      work.title, work.author, "rezero", "Re Zero", "re:zero", "ريزيرو", "ري زيرو",
      "رواية ريزيرو", "رواية خفيفة", "ترجمة ريزيرو", "أصوات البرج", ...(work.tags || [])
    ],
    alternates: { canonical: `${baseUrl}/works/${slug}` },
    twitter: {
      card: "summary_large_image",
      title: `${work.title} - أصوات البرج`,
      description: description,
      images: [coverUrl],
    },
    openGraph: {
      title: work.title,
      description: description,
      url: `${baseUrl}/works/${slug}`,
      siteName: "أصوات البرج",
      images: [{ url: coverUrl, width: 800, height: 1200 }],
      type: "article",
    }
  };
}

// دالة جلب البيانات المعدلة لحساب المتوسط المرجح (يدوي + تلقائي)
async function getWork(slug: string) {
  const query = `*[_type == "work" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, "rawCover": cover, author, tags, status,
    synopsis, isSpoiler, timeDescription, 
    
    // 1. حساب تقييم القصة (يدوي + تلقائي)
    "storyRating": 
      ((coalesce(storyRating, 0) * coalesce(ratingCount, 0)) + 
      coalesce(math::sum(*[_type == "rating" && work._ref == ^._id].ratingWork), 0)) 
      / 
      (coalesce(ratingCount, 0) + count(*[_type == "rating" && work._ref == ^._id])),

    // 2. حساب تقييم الترجمة (يدوي + تلقائي)
    "translationRating": 
      ((coalesce(translationRating, 0) * coalesce(ratingCount, 0)) + 
      coalesce(math::sum(*[_type == "rating" && work._ref == ^._id].ratingTranslation), 0)) 
      / 
      (coalesce(ratingCount, 0) + count(*[_type == "rating" && work._ref == ^._id])),

    // 3. العدد الكلي للمقيمين (العدد اليدوي + عدد الزوار الفعليين)
    // نعيد تسمية الحقل مؤقتاً لنتجنب التعارض، أو نستخدمه مباشرة
    "totalRatingCount": coalesce(ratingCount, 0) + count(*[_type == "rating" && work._ref == ^._id]),

    "pdfUrl": coalesce(readerUrl, pdfFile.asset->url, downloadUrl),
    "previousWork": previousWork->{ title, "slug": slug.current, "rawCover": cover },
    "nextWork": nextWork->{ title, "slug": slug.current, "rawCover": cover },
    "relatedSideStories": *[_type == "work" && parentVolume._ref == ^._id] {
      title, "slug": slug.current, "rawCover": cover
    },
    "comments": *[_type == "comment" && work._ref == ^._id && approved == true] | order(_createdAt desc)
  }`;
  
  // revalidate: 0 مهم لتحديث التقييم فوراً عند كل زيارة
  return await client.fetch(query, { slug }, { next: { revalidate: 0 } });
}

const NavCard = ({ work, label, isNext }: { work: any, label: string, isNext: boolean }) => {
  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";
  return (
    <Link href={`/works/${work.slug}`} className="group relative flex-1">
      <div className={`rounded-2xl overflow-hidden transition-all duration-500 border ${isNext ? "bg-blue-900/10 border-blue-500/30 shadow-lg hover:border-blue-400" : "bg-zinc-900/50 border-white/5 hover:border-white/20"} hover:-translate-y-1`}>
        <div className="flex items-center gap-4 p-3 flex-row-reverse">
          <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-white/10">
            <img src={coverUrl} alt={work.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${isNext ? "text-blue-400" : "text-gray-500"}`}>{label}</span>
            <h4 className="text-sm font-bold truncate text-white">{work.title}</h4>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) return notFound();
  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";

  // Helper to format rating nicely
  // نتأكد من أن القيمة رقم صحيح قبل استخدام toFixed لتجنب الأخطاء إذا كانت null
  const formatRating = (rating: number) => (rating && !isNaN(rating)) ? rating.toFixed(1) : "0.0";

  return (
    <main dir="rtl" className="bg-[#050505] text-gray-200 min-h-screen font-sans text-right overflow-x-hidden">
      
      {/* Breadcrumbs */}
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2 text-[10px] md:text-xs text-gray-500 font-bold border-b border-white/5 justify-start">
        <Link href="/" className="hover:text-blue-500 transition-colors">الرئيسية</Link>
        <FaChevronLeft className="text-[8px] opacity-30" />
        <Link href="/works" className="hover:text-blue-500 transition-colors">المكتبة</Link>
        <FaChevronLeft className="text-[8px] opacity-30" />
        <span className="text-gray-300 truncate max-w-[150px]">{work.title}</span>
      </nav>
      
      {/* 1. قسم الهيرو */}
      <section className="relative min-h-[60vh] w-full overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-cover bg-center scale-110 blur-md opacity-30" style={{ backgroundImage: `url(${coverUrl})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full py-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            
            {/* الغلاف + التقييم */}
            <div className="relative group shrink-0 flex flex-col items-center order-1 md:order-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative w-44 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img src={coverUrl} alt={work.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
              </div>
              
              {/* التقييمات */}
              <div className="mt-4 w-full space-y-3">
                <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-xl flex flex-col items-center gap-1">
                    <div className="w-full flex justify-between items-center text-[10px] font-bold text-yellow-500 uppercase tracking-wider mb-1">
                      <div className="flex items-center gap-2"><FaStar /> تقييم القصة</div>
                      <span className="bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-400 font-mono text-xs">{formatRating(work.storyRating)}</span>
                    </div>
                    <InteractiveRating 
                      workId={work._id} 
                      initialRating={work.storyRating || 0} 
                      fieldName="ratingWork" 
                    />
                </div>
                <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-xl flex flex-col items-center gap-1">
                    <div className="w-full flex justify-between items-center text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                       <div className="flex items-center gap-2"><FaLanguage className="text-lg" /> تقييم الترجمة</div>
                       <span className="bg-blue-500/10 px-2 py-0.5 rounded text-blue-400 font-mono text-xs">{formatRating(work.translationRating)}</span>
                    </div>
                    <InteractiveRating 
                      workId={work._id} 
                      initialRating={work.translationRating || 0} 
                      fieldName="ratingTranslation" 
                    />
                </div>
              </div>
            </div>
            
            {/* النصوص */}
            <div className="flex-1 w-full flex flex-col order-2 md:order-1 items-center md:items-start text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6 w-full">
                {work.tags?.map((tag: string, index: number) => (
                  <span key={index} className="bg-blue-600/10 text-blue-400 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-blue-600/20">{tag}</span>
                ))}
                <span className="bg-green-500/10 text-green-400 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-green-500/20">{work.status}</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-8 text-white tracking-tight leading-tight w-full">
                {work.title}
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center w-full">
                <div className="w-full sm:w-auto">
                    <ReaderButton slug={work.slug} />
                </div>
                {work.pdfUrl && (
                  <a href={work.pdfUrl} target="_blank" className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-bold transition border border-white/10 w-full sm:w-auto">
                    <FaDownload /> تحميل PDF
                  </a>
                )}
                <div className="w-full sm:w-auto">
                    <ReportButton workTitle={work.title} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. الشبكة: ملخص القصة والقائمة الجانبية */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                    <FaBookOpen className="text-blue-500 text-xl" />
                </div>
                <h2 className="font-black text-2xl text-white">ملخص القصة</h2>
              </div>
              
              <div className="prose prose-invert max-w-none text-gray-300 leading-loose text-lg font-medium text-right">
                <SpoilerSynopsis text={work.synopsis || "لا يوجد ملخص متاح حالياً."} isSpoiler={work.isSpoiler || false} />
              </div>
            </div>

            {(work.previousWork || work.nextWork || work.relatedSideStories?.length > 0) && (
                <div className="space-y-8 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <FaLayerGroup className="text-blue-600" /> رحلة البرج
                          </h3>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {work.nextWork && <NavCard work={work.nextWork} label="المجلد التالي" isNext={true} />}
                        {work.previousWork && <NavCard work={work.previousWork} label="المجلد السابق" isNext={false} />}
                    </div>
                    
                    {work.relatedSideStories?.length > 0 && (
                        <div className="mt-10 space-y-6">
                            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 text-right">قصص جانبية تابعة لهذا المجلد</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {work.relatedSideStories.map((side: any) => (
                                    <Link key={side.slug} href={`/works/${side.slug}`} className="group flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-2xl hover:border-blue-500/30 transition-all flex-row-reverse">
                                            <div className="w-12 h-16 shrink-0 rounded-xl overflow-hidden border border-white/5">
                                                <img src={side.rawCover ? urlFor(side.rawCover).url() : ""} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[12px] font-bold text-gray-400 group-hover:text-blue-400 transition-colors line-clamp-2 text-right">{side.title}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-zinc-900/80 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl flex flex-col sticky top-24">
              <h3 className="text-xl font-bold mb-10 text-white border-b border-white/5 pb-6 flex items-center gap-2 justify-end">
                 معلومات العمل <FaInfoCircle className="text-blue-500" />
              </h3>
              <div className="space-y-8 text-sm flex-1">
                <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl flex-row-reverse">
                    <span className="text-gray-500">حالة العمل</span>
                    <span className="text-green-400 font-bold">{work.status}</span>
                </div>
                {work.timeDescription && (
                  <div className="flex flex-col gap-3 bg-white/5 p-5 rounded-2xl text-right">
                      <span className="text-gray-500 flex items-center gap-2 justify-end"> الموقع الزمني <FaClock className="text-blue-500" /></span>
                      <span className="text-white font-bold leading-relaxed">{work.timeDescription}</span>
                  </div>
                )}
                <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl flex-row-reverse">
                    <span className="text-gray-500">المؤلف</span>
                    <span className="text-white font-bold">{work.author || "تابِي ناغاتسُكي"}</span>
                </div>
                <div className="flex justify-between items-center bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex-row-reverse">
                    <span className="text-gray-500">عدد المقيمين</span>
                    {/* استخدام totalRatingCount المحسوب حديثاً */}
                    <span className="text-blue-400 font-bold">{work.totalRatingCount || 0}</span>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5">
                <div className="flex justify-center md:justify-end">
                   <ShareButtons url={`${baseUrl}/works/${work.slug}`} title={work.title} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div id="comments-section" className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 md:p-14 shadow-2xl space-y-12">
          <h2 className="font-black text-2xl text-white flex items-center gap-4 border-b border-white/5 pb-8 justify-end">
            آراء القراء ({work.comments?.length || 0}) <FaComments className="text-blue-600 text-3xl" />
          </h2>
          <div className="pt-4">
            <CommentForm workId={work._id} />
          </div>
        </div>
      </section>
    </main>
  );
}