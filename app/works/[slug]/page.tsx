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
  FaLanguage,
  FaExclamationTriangle,
  FaPlusSquare,
  FaShareAlt
} from "react-icons/fa";

interface Props {
  params: Promise<{ slug: string }>;
}

const baseUrl = "https://towervoices.online";

/**
 * 1. محرك SEO: استعادة المصفوفة الضخمة للكلمات المفتاحية لضمان تصدر البحث
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) return { title: "العمل غير موجود" };
  const coverUrl = work.cover ? urlFor(work.cover).url() : "";

  return {
    title: work.title,
    description: work.synopsis?.slice(0, 160) || "استكشف ترجمة رواية ريزيرو الحصرية على منصة أصوات البرج.",
    keywords: [
      work.title, work.author, "rezero", "Re Zero", "re:zero", "re zero novel", 
      "rezero light novel", "ريزيرو", "ري زيرو", "رواية ري زيرو", "رواية ريزيرو", 
      "رواية خفيفة", "ترجمة ريزيرو", "أصوات البرج", "Tower Voices", "روايات مترجمة", 
      "ارك", "arc", "ex", "مجلد", "قراءة اونلاين", "فيلت", "راينهارد", "ساتيلا",
      ...(work.tags || [])
    ],
    alternates: { canonical: `${baseUrl}/works/${slug}` },
    twitter: {
      card: "summary_large_image",
      title: `${work.title} - أصوات البرج`,
      images: [coverUrl],
    },
    openGraph: {
      title: work.title,
      url: `${baseUrl}/works/${slug}`,
      images: [{ url: coverUrl, width: 800, height: 1200 }],
    }
  };
}

/**
 * 2. استعلام GROQ الشامل: جلب كافة المميزات وحساب المتوسطات بدقة
 */
async function getWork(slug: string) {
  const query = `*[_type == "work" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, cover, author, tags, status, priority,
    synopsis, isSpoiler, warning, // ميزات القصة والتحذير
    ratingWork, ratingTranslation, ratingCount, 
    downloadUrl, readerUrl, "pdfFileUrl": pdfFile.asset->url,
    timeDescription, storyType, chronologicalOrder,
    "previousWork": previousWork->{ title, "slug": slug.current, cover },
    "nextWork": nextWork->{ title, "slug": slug.current, cover },
    "relatedSideStories": *[_type == "work" && parentVolume._ref == ^._id] {
      title, "slug": slug.current, cover
    },
    "comments": *[_type == "comment" && work._ref == ^._id && approved == true] | order(_createdAt desc),
    
    // معادلة المتوسط الموزون المحصنة
    "currentStoryRating": select(
      (coalesce(ratingCount, 0) + count(*[_type == "rating" && work._ref == ^._id])) > 0 => 
      ((coalesce(ratingWork, 0) * coalesce(ratingCount, 0)) + coalesce(math::sum(*[_type == "rating" && work._ref == ^._id].ratingWork), 0)) 
      / (coalesce(ratingCount, 0) + count(*[_type == "rating" && work._ref == ^._id])),
      0
    ),
    "currentTransRating": select(
      (coalesce(ratingCount, 0) + count(*[_type == "rating" && work._ref == ^._id])) > 0 => 
      ((coalesce(ratingTranslation, 0) * coalesce(ratingCount, 0)) + coalesce(math::sum(*[_type == "rating" && work._ref == ^._id].ratingTranslation), 0)) 
      / (coalesce(ratingCount, 0) + count(*[_type == "rating" && work._ref == ^._id])),
      0
    ),
    "totalCount": coalesce(ratingCount, 0) + count(*[_type == "rating" && work._ref == ^._id])
  }`;
  return await client.fetch(query, { slug }, { next: { revalidate: 0 } });
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) return notFound();
  const coverUrl = work.cover ? urlFor(work.cover).url() : "";

  const formatRating = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) || num <= 0 ? "0.0" : num.toFixed(1);
  };

  return (
    <main dir="rtl" className="bg-[#050505] text-gray-200 min-h-screen font-sans text-right overflow-x-hidden">
      
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3 text-[10px] md:text-xs text-gray-500 font-bold border-b border-white/5">
        <Link href="/" className="hover:text-blue-500 transition-colors">الرئيسية</Link>
        <FaChevronLeft className="text-[7px] opacity-20" />
        <Link href="/works" className="hover:text-blue-500 transition-colors">المكتبة</Link>
        <FaChevronLeft className="text-[7px] opacity-20" />
        <span className="text-gray-300 truncate max-w-[200px]">{work.title}</span>
      </nav>
      
      {/* 3. قسم الهيرو: (النص يمين، الغلاف يسار) - الترتيب الصحيح للعربية */}
      <section className="relative min-h-[65vh] w-full overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-20" style={{ backgroundImage: `url(${coverUrl})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full pb-16">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-end">
            
            {/* الجهة اليمنى: النصوص والوسوم */}
            <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                {work.tags?.map((tag: string, i: number) => (
                  <span key={i} className="bg-blue-600/5 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-600/10 uppercase tracking-wider">{tag}</span>
                ))}
                <span className="bg-green-500/5 text-green-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-green-500/10 uppercase tracking-wider">{work.status}</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-10 text-white tracking-tight leading-[1.2] w-full break-words">
                {work.title}
              </h1>

              {/* الأزرار: تبدأ بالقراءة من اليمين */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center w-full">
                <ReaderButton slug={work.slug} />
                {(work.pdfFileUrl || work.downloadUrl) && (
                  <a href={work.pdfFileUrl || work.downloadUrl} target="_blank" className="flex items-center justify-center gap-3 bg-zinc-900/80 hover:bg-zinc-800 text-white px-10 py-4 rounded-2xl font-black transition-all border border-white/5 w-full sm:w-auto shadow-xl group">
                    <FaDownload className="group-hover:translate-y-0.5 transition-transform" /> تحميل PDF
                  </a>
                )}
                <ReportButton workTitle={work.title} />
              </div>
            </div>

            {/* الجهة اليسرى: الغلاف والتقييمات الرقمية */}
            <div className="relative group shrink-0 flex flex-col items-center">
              <div className="relative w-48 md:w-72 aspect-[2/3] rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
                <img src={coverUrl} alt={work.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-1000" />
              </div>
              
              <div className="mt-6 w-full space-y-3">
                <div className="bg-zinc-900/60 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center gap-1">
                    <div className="w-full flex justify-between items-center text-[10px] font-black text-yellow-500 mb-1">
                      <div className="flex items-center gap-2"><FaStar /> تقييم القصة</div>
                      <span className="bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-400 font-mono text-xs">{formatRating(work.currentStoryRating)}</span>
                    </div>
                    <InteractiveRating workId={work._id} initialRating={work.currentStoryRating || 0} fieldName="ratingWork" />
                </div>
                <div className="bg-zinc-900/60 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center gap-1">
                    <div className="w-full flex justify-between items-center text-[10px] font-black text-blue-400 mb-1">
                        <div className="flex items-center gap-2"><FaLanguage className="text-sm" /> تقييم الترجمة</div>
                        <span className="bg-blue-500/10 px-2 py-0.5 rounded text-blue-400 font-mono text-xs">{formatRating(work.currentTransRating)}</span>
                    </div>
                    <InteractiveRating workId={work._id} initialRating={work.currentTransRating || 0} fieldName="ratingTranslation" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. منطقة المحتوى: (الملخص يمين، المعلومات يسار) */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-8 space-y-12 order-1">
            {/* تنبيه المترجم */}
            {work.warning && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-[2rem] p-8 flex items-start gap-5 text-red-400 animate-pulse-slow">
                <FaExclamationTriangle className="text-xl shrink-0 mt-1" />
                <div><h4 className="font-black text-xs mb-2 uppercase tracking-widest opacity-80">تنبيه من المترجم</h4><p className="font-bold leading-relaxed">{work.warning}</p></div>
              </div>
            )}

            <div className="bg-zinc-900/20 border border-white/5 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-5 mb-10 justify-end">
                <h2 className="font-black text-3xl text-white">ملخص القصة</h2>
                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center shadow-inner"><FaBookOpen className="text-blue-500 text-2xl" /></div>
              </div>
              <div className="prose prose-invert max-w-none text-gray-300 leading-[2.2] text-lg font-medium text-right">
                <SpoilerSynopsis text={work.synopsis || "لا يوجد ملخص متاح حالياً."} isSpoiler={work.isSpoiler} />
              </div>
            </div>

            {/* رحلة البرج + القصص الجانبية */}
            <div className="space-y-12">
                {(work.previousWork || work.nextWork) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {work.nextWork && <NavCard work={work.nextWork} label="المجلد التالي" isNext={true} />}
                      {work.previousWork && <NavCard work={work.previousWork} label="المجلد السابق" isNext={false} />}
                  </div>
                )}

                {work.relatedSideStories && work.relatedSideStories.length > 0 && (
                    <div className="pt-6 space-y-8">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-blue-500/10 to-transparent"></div>
                            <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2"><FaPlusSquare /> قصص جانبية تابعة</h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {work.relatedSideStories.map((side: any) => (
                                <Link key={side.slug} href={`/works/${side.slug}`} className="group bg-white/[0.01] border border-white/5 p-3 rounded-2xl hover:border-blue-500/40 transition-all flex items-center gap-4 flex-row-reverse">
                                    <div className="w-14 h-20 shrink-0 rounded-xl overflow-hidden border border-white/5 shadow-lg">
                                        <img src={side.cover ? urlFor(side.cover).url() : ""} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                    </div>
                                    <span className="text-[13px] font-black text-gray-400 group-hover:text-blue-400 transition-colors line-clamp-2 text-right flex-1">{side.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 order-2 sticky top-28">
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl flex flex-col">
              <h3 className="text-xl font-black mb-10 text-white border-b border-white/5 pb-6 flex items-center gap-3 justify-end uppercase tracking-widest">معلومات العمل <FaInfoCircle className="text-blue-500" /></h3>
              <div className="space-y-6 text-sm flex-1">
                <div className="flex justify-between items-center bg-white/[0.02] p-5 rounded-[1.5rem] border border-white/5 flex-row-reverse"><span className="text-gray-500 font-bold">حالة العمل</span><span className="text-green-400 font-black tracking-wide">{work.status}</span></div>
                {work.timeDescription && (<div className="flex flex-col gap-3 bg-white/[0.02] p-5 rounded-[1.5rem] border border-white/5 text-right"><span className="text-gray-500 font-bold flex items-center gap-2 justify-end">الموقع الزمني <FaClock className="text-blue-500 text-xs" /></span><span className="text-white font-black leading-relaxed">{work.timeDescription}</span></div>)}
                <div className="flex justify-between items-center bg-white/[0.02] p-5 rounded-[1.5rem] border border-white/5 flex-row-reverse"><span className="text-gray-500 font-bold">المؤلف</span><span className="text-white font-black">{work.author || "تابِي ناغاتسُكي"}</span></div>
                <div className="flex justify-between items-center bg-blue-500/[0.03] p-5 rounded-[1.5rem] border border-blue-500/10 flex-row-reverse"><span className="text-gray-500 font-bold">عدد المقيمين</span><span className="text-blue-400 font-black font-mono text-base">{work.totalCount || 0}</span></div>
              </div>
              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center md:items-end">
                  <span className="text-[9px] font-black text-gray-600 mb-4 tracking-[0.3em] uppercase flex items-center gap-2">مشاركة العمل <FaShareAlt className="text-[8px]" /></span>
                  <ShareButtons url={`${baseUrl}/works/${work.slug}`} title={work.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قسم التعليقات */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div id="comments-section" className="bg-zinc-900/10 border border-white/5 rounded-[3.5rem] p-10 md:p-20 shadow-inner space-y-16">
          <div className="flex flex-col items-center md:items-end gap-3 border-b border-white/5 pb-10">
              <div className="flex items-center gap-5 justify-end w-full"><h2 className="font-black text-3xl text-white">آراء القراء</h2><div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center shadow-lg"><FaComments className="text-blue-500 text-3xl" /></div></div>
              <span className="text-gray-500 font-bold text-xs">يوجد ({work.comments?.length || 0}) تعليق على هذا العمل</span>
          </div>
          <div className="pt-4"><CommentForm workId={work._id} /></div>
        </div>
      </section>
    </main>
  );
}

const NavCard = ({ work, label, isNext }: { work: any, label: string, isNext: boolean }) => {
  const coverUrl = work.cover ? urlFor(work.cover).url() : "";
  return (
    <Link href={`/works/${work.slug}`} className="group relative flex-1">
      <div className={`rounded-[1.5rem] overflow-hidden transition-all duration-700 border ${isNext ? "bg-blue-600/[0.03] border-blue-500/20 shadow-2xl hover:border-blue-500/40" : "bg-white/[0.01] border-white/5 hover:border-white/10"} group-hover:-translate-y-2`}>
        <div className="flex items-center gap-5 p-4 flex-row-reverse">
          <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden border border-white/5 shadow-lg">
            <img src={coverUrl} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className={`text-[9px] font-black uppercase block mb-2 ${isNext ? "text-blue-500" : "text-gray-600"}`}>{label}</span>
            <h4 className="text-base font-black truncate text-white group-hover:text-blue-400 transition-colors">{work.title}</h4>
          </div>
        </div>
      </div>
    </Link>
  );
};