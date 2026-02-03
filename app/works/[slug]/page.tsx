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
  FaExclamationTriangle, 
  FaBookOpen, 
  FaShareAlt,
  FaComments,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaArrowRight,
  FaArrowLeft,
  FaLayerGroup
} from "react-icons/fa";

interface Props {
  params: Promise<{ slug: string; }>;
}

const baseUrl = "https://towervoices.online";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);
  
  if (!work) return {};

  const lowerSlug = slug.toLowerCase();
  let typeSuffix = "";

  if (lowerSlug.includes("if")) typeSuffix = " (Re:Zero IF Route)";
  else if (lowerSlug.includes("ex")) typeSuffix = " (Re:Zero EX Novel)";
  else if (lowerSlug.includes("arc")) typeSuffix = " (Re:Zero Web Novel)";
  else typeSuffix = " (Re:Zero Side Story)";

  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";

  return {
    title: `${work.title}${typeSuffix} | أصوات البرج`,
    description: `قراءة ترجمة ${work.title} ${typeSuffix} بالعربية. استمتع بأحداث ريزيرو المترجمة بأسلوب احترافي حصرياً على أصوات البرج.`,
    alternates: {
      canonical: `${baseUrl}/works/${slug}`, 
    },
    openGraph: {
      title: `${work.title} ${typeSuffix}`,
      description: work.synopsis?.slice(0, 160),
      url: `${baseUrl}/works/${slug}`,
      siteName: "أصوات البرج",
      images: [
        {
          url: coverUrl, 
          width: 800,
          height: 1200,
          alt: `غلاف رواية ${work.title}`
        },
      ],
      type: "article",
    },
  };
}

// استعلام GROQ الشامل
async function getWork(slug: string) {
  const query = `*[_type == "work" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
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
    "pdfUrl": coalesce(readerUrl, pdfFile.asset->url, downloadUrl),
    "previousWork": previousWork->{ title, "slug": slug.current, "rawCover": cover },
    "nextWork": nextWork->{ title, "slug": slug.current, "rawCover": cover },
    "parentVolume": parentVolume->{ title, "slug": slug.current, "rawCover": cover },
    "relatedSideStories": *[_type == "work" && parentVolume._ref == ^._id] {
      title,
      "slug": slug.current,
      "rawCover": cover
    },
    "comments": *[_type == "comment" && work._ref == ^._id && approved == true] | order(_createdAt desc)
  }`;
  
  return await client.fetch(query, { slug }, { next: { revalidate: 60 } });
}

// --- التحديث هنا: مكون البطاقة مع تأثير التوهج الذكي ---
const NavCard = ({ work, label, isNext }: { work: any, label: string, isNext: boolean }) => {
    const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";
    return (
        <Link href={`/works/${work.slug}`} className="group relative flex-1">
            {/* هنا نطبق ستايل مختلف بناءً على هل هي البطاقة التالية أم السابقة */}
            <div className={`
                rounded-2xl overflow-hidden transition-all duration-500
                ${isNext 
                    // ستايل المجلد التالي: توهج أزرق وخلفية مميزة
                    ? "bg-blue-900/10 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:border-blue-400 hover:-translate-y-1"
                    // ستايل المجلد السابق: ستايل هادئ
                    : "bg-zinc-900/50 border border-white/5 hover:border-white/20 hover:shadow-lg hover:-translate-y-1"
                }
            `}>
                <div className="flex items-center gap-4 p-3">
                    <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-white/10">
                        <img src={coverUrl} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {/* تغيير لون النص حسب نوع البطاقة */}
                        <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${isNext ? "text-blue-400" : "text-gray-500"}`}>{label}</span>
                        <h4 className={`text-sm font-bold truncate transition-colors ${isNext ? "text-white group-hover:text-blue-300" : "text-gray-300 group-hover:text-white"}`}>{work.title}</h4>
                        <div className="mt-2 flex items-center gap-1 text-gray-500 group-hover:text-gray-300">
                             {isNext ? <FaArrowLeft className="text-[10px] text-blue-500" /> : <FaArrowRight className="text-[10px]" />}
                             <span className={`text-[10px] font-bold ${isNext ? "text-blue-500" : ""}`}>{isNext ? "اذهب للمجلد التالي" : "العودة للمجلد السابق"}</span>
                        </div>
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

  const workRating = work.ratingWork || 0; 
  const translationRating = work.ratingTranslation || 0;
  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";
  const finalPdfUrl = work.pdfUrl; 

  return (
    <main dir="rtl" className="bg-[#050505] text-gray-200 min-h-screen font-sans overflow-x-hidden">
      
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2 text-[10px] md:text-xs text-gray-500 font-bold border-b border-white/5">
        <Link href="/" className="hover:text-blue-500 transition-colors">الرئيسية</Link>
        <FaChevronLeft className="text-[8px] opacity-30" />
        <Link href="/works" className="hover:text-blue-500 transition-colors">الروايات</Link>
        <FaChevronLeft className="text-[8px] opacity-30" />
        <span className="text-gray-300 truncate max-w-[150px]">{work.title}</span>
      </nav>
      
      <section className="relative min-h-[55vh] md:h-[65vh] w-full overflow-hidden flex items-end">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md opacity-30 transition-all duration-700"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 w-full pb-10 md:pb-16">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end w-full">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative w-40 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
                <img src={coverUrl} alt={work.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-right w-full">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {work.tags?.map((tag: string, index: number) => (
                  <span key={index} className="bg-blue-600/10 text-blue-400 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-blue-600/20 backdrop-blur-md">{tag}</span>
                ))}
                <span className="bg-green-500/10 text-green-400 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-green-500/20 capitalize">{work.status}</span>
              </div>
              <h1 className="text-3xl md:text-6xl font-black mb-6 text-white leading-tight tracking-tight">{work.title}</h1>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                <ReaderButton slug={work.slug} />
                {finalPdfUrl && (
                  <a href={finalPdfUrl} target="_blank" className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-white/10 w-full sm:w-auto shadow-xl">
                    <FaDownload className="text-lg" /> تحميل PDF
                  </a>
                )}
                <ReportButton workTitle={work.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                    <FaBookOpen className="text-blue-500 text-xl" />
                </div>
                <h2 className="font-black text-2xl text-white">ملخص القصة</h2>
              </div>
              <div className="prose prose-invert max-w-none text-gray-300 leading-loose text-lg">
                <SpoilerSynopsis text={work.synopsis || "لا يوجد ملخص متاح حالياً."} isSpoiler={work.isSpoiler || false} />
              </div>
            </div>

            {/* نظام التنقل الذكي والقصص الجانبية */}
            {(work.previousWork || work.nextWork || work.parentVolume || work.relatedSideStories?.length > 0) && (
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                         <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <FaLayerGroup className="text-blue-600" /> رحلة البرج
                         </h3>
                         <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {work.previousWork && <NavCard work={work.previousWork} label="المجلد السابق" isNext={false} />}
                        {work.nextWork && <NavCard work={work.nextWork} label="المجلد التالي" isNext={true} />}
                    </div>

                    {work.relatedSideStories?.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">قصص جانبية تابعة لهذا المجلد</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {work.relatedSideStories.map((side: any) => (
                                    <Link key={side.slug} href={`/works/${side.slug}`} className="group flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-xl hover:border-blue-500/30 transition-all">
                                        <div className="w-10 h-14 shrink-0 rounded-md overflow-hidden border border-white/5">
                                            <img src={side.rawCover ? urlFor(side.rawCover).url() : ""} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-blue-400 transition-colors line-clamp-2">{side.title}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {work.parentVolume && (
                        <Link href={`/works/${work.parentVolume.slug}`} className="flex items-center justify-center gap-2 p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl text-xs font-bold text-blue-400 hover:bg-blue-600/10 transition-all mt-4">
                            العودة للمجلد الرئيسي: {work.parentVolume.title}
                        </Link>
                    )}
                </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/80 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-8 text-white border-b border-white/5 pb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" /> معلومات العمل
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <span className="text-gray-500 text-sm">حالة العمل</span>
                    <span className="text-green-400 font-bold">{work.status}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <span className="text-gray-500 text-sm">المؤلف</span>
                    <span className="text-white font-bold">{work.author || "تابي ناجاتسوكي"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-20">
        <div id="comments-section" className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="font-black text-2xl text-white flex items-center gap-3">
              <FaComments className="text-blue-600 text-3xl" />
              آراء القراء ({work.comments?.length || 0})
            </h2>
          </div>
          <div className="pt-10 border-t border-white/5">
            <CommentForm workId={work._id} />
          </div>
        </div>
      </section>
    </main>
  );
}