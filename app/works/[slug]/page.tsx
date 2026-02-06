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
  FaExclamationTriangle // أيقونة التحذير
} from "react-icons/fa";

interface Props {
  params: Promise<{ slug: string }>;
}

const baseUrl = "https://towervoices.online";

/**
 * 1. السيو (SEO): استعادة الكلمات المفتاحية بالكامل
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) return { title: "العمل غير موجود" };
  const coverUrl = work.cover ? urlFor(work.cover).url() : "";

  return {
    title: work.title,
    description: work.synopsis?.slice(0, 160),
    keywords: [
      work.title, work.author, "rezero", "Re Zero", "re:zero", "re zero novel", 
      "ريزيرو", "ري زيرو", "رواية ريزيرو", "أصوات البرج", "Tower Voices",
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
      siteName: "أصوات البرج",
      images: [{ url: coverUrl, width: 800, height: 1200 }],
      type: "article",
    }
  };
}

/**
 * 2. استعلام GROQ: جلب كافة الحقول بناءً على الـ Schema المحدثة
 */
async function getWork(slug: string) {
  const query = `*[_type == "work" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, cover, author, tags, status, priority,
    synopsis, isSpoiler, warning, // ميزات القصة
    ratingWork, ratingTranslation, ratingCount, // ميزات التقييم
    downloadUrl, readerUrl, "pdfFileUrl": pdfFile.asset->url, // الروابط والملفات
    timeDescription, storyType, chronologicalOrder, // رحلة البرج
    "previousWork": previousWork->{ title, "slug": slug.current, cover },
    "nextWork": nextWork->{ title, "slug": slug.current, cover },
    "relatedSideStories": *[_type == "work" && parentVolume._ref == ^._id] {
      title, "slug": slug.current, cover
    },
    "comments": *[_type == "comment" && work._ref == ^._id && approved == true] | order(_createdAt desc),
    
    // حساب المتوسط الحقيقي (التقييم اليدوي + تقييمات الجمهور)
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
      
      {/* شريط المسارات */}
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2 text-[10px] md:text-xs text-gray-500 font-bold border-b border-white/5">
        <Link href="/" className="hover:text-blue-500 transition-colors">الرئيسية</Link>
        <FaChevronLeft className="text-[8px] opacity-30" />
        <Link href="/works" className="hover:text-blue-500 transition-colors">المكتبة</Link>
        <FaChevronLeft className="text-[8px] opacity-30" />
        <span className="text-gray-300 truncate max-w-[150px]">{work.title}</span>
      </nav>
      
      {/* 3. قسم الهيرو: (الغلاف يمين، النص يسار) */}
      <section className="relative min-h-[65vh] w-full overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-cover bg-center scale-110 blur-md opacity-30" style={{ backgroundImage: `url(${coverUrl})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full pb-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-end">
            
            {/* جهة اليمين: الغلاف والتقييمات */}
            <div className="relative group shrink-0 flex flex-col items-center">
              <div className="relative w-44 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img src={coverUrl} alt={work.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
              </div>
              
              <div className="mt-4 w-full space-y-3">
                {/* تقييم القصة */}
                <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-xl flex flex-col items-center">
                    <div className="w-full flex justify-between items-center text-[10px] font-bold text-yellow-500 uppercase tracking-wider mb-1">
                      <div className="flex items-center gap-2"><FaStar /> تقييم القصة</div>
                      <span className="bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-400 font-mono text-xs">{formatRating(work.currentStoryRating)}</span>
                    </div>
                    <InteractiveRating workId={work._id} initialRating={work.currentStoryRating || 0} fieldName="ratingWork" />
                </div>
                {/* تقييم الترجمة */}
                <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-xl flex flex-col items-center">
                    <div className="w-full flex justify-between items-center text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                        <div className="flex items-center gap-2"><FaLanguage className="text-lg" /> تقييم الترجمة</div>
                        <span className="bg-blue-500/20 px-2 py-0.5 rounded text-blue-400 font-mono text-xs">{formatRating(work.currentTransRating)}</span>
                    </div>
                    <InteractiveRating workId={work._id} initialRating={work.currentTransRating || 0} fieldName="ratingTranslation" />
                </div>
              </div>
            </div>
            
            {/* جهة اليسار: العناوين والأزرار */}
            <div className="flex-1 text-center md:text-right w-full flex flex-col">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6 flex-row-reverse">
                {work.tags?.map((tag: string, index: number) => (
                  <span key={index} className="bg-blue-600/10 text-blue-400 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-blue-600/20">{tag}</span>
                ))}
                <span className="bg-green-500/10 text-green-400 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-green-500/20">{work.status}</span>
              </div>
              <h1 className="text-3xl md:text-6xl font-black mb-8 text-white tracking-tight leading-tight w-full">{work.title}</h1>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                <ReaderButton slug={work.slug} />
                {(work.pdfFileUrl || work.downloadUrl) && (
                  <a href={work.pdfFileUrl || work.downloadUrl} target="_blank" className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-bold transition border border-white/10 w-full sm:w-auto">
                    <FaDownload /> تحميل PDF
                  </a>
                )}
                <ReportButton workTitle={work.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. منطقة المحتوى: (الملخص يمين، المعلومات يسار) */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* العمود الأيمن (الملخص والتحذير) */}
          <div className="lg:col-span-8 space-y-10 order-1">
            {/* عرض نص التحذير إذا وجد */}
            {work.warning && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex items-start gap-4 text-red-400">
                <FaExclamationTriangle className="text-2xl shrink-0 mt-1" />
                <div>
                  <h4 className="font-black text-sm mb-1 uppercase tracking-widest">تنبيه من المترجم</h4>
                  <p className="text-sm font-bold leading-relaxed">{work.warning}</p>
                </div>
              </div>
            )}

            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-4 mb-8 justify-end">
                <h2 className="font-black text-2xl text-white">ملخص القصة</h2>
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                    <FaBookOpen className="text-blue-500 text-xl" />
                </div>
              </div>
              <div className="prose prose-invert max-w-none text-gray-300 leading-loose text-lg font-medium text-right">
                <SpoilerSynopsis text={work.synopsis || "لا يوجد ملخص متاح حالياً."} isSpoiler={work.isSpoiler} />
              </div>
            </div>

            {/* رحلة البرج والقصص الجانبية */}
            {(work.previousWork || work.nextWork || (work.relatedSideStories && work.relatedSideStories.length > 0)) && (
                <div className="space-y-8 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                           رحلة البرج <FaLayerGroup className="text-blue-600" />
                        </h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {work.nextWork && <NavCard work={work.nextWork} label="المجلد التالي" isNext={true} />}
                        {work.previousWork && <NavCard work={work.previousWork} label="المجلد السابق" isNext={false} />}
                    </div>
                </div>
            )}
          </div>

          {/* العمود الأيسر (معلومات العمل) */}
          <div className="lg:col-span-4 space-y-8 order-2">
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
                    <span className="text-blue-400 font-bold">{work.totalCount || 0}</span>
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

      {/* قسم التعليقات */}
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

// دالة مساعدة لبطاقات التنقل
const NavCard = ({ work, label, isNext }: { work: any, label: string, isNext: boolean }) => {
  const coverUrl = work.cover ? urlFor(work.cover).url() : "";
  return (
    <Link href={`/works/${work.slug}`} className="group relative flex-1">
      <div className={`rounded-2xl overflow-hidden transition-all duration-500 border ${isNext ? "bg-blue-900/10 border-blue-500/30 shadow-lg hover:border-blue-400" : "bg-zinc-900/50 border-white/5 hover:border-white/20"} hover:-translate-y-1`}>
        <div className="flex items-center gap-4 p-3 flex-row-reverse">
          <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-white/10">
            <img src={coverUrl} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
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