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
  FaChevronLeft
} from "react-icons/fa";

interface Props {
  params: Promise<{ slug: string; }>;
}

const baseUrl = "https://tower-voices-pdf.vercel.app";

// 1. تحسين الميتا داتا وإضافة صور المعاينة (Social Media Images)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);
  
  if (!work) return {};

  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";

  return {
    title: `${work.title} | أصوات البرج`,
    description: work.synopsis?.slice(0, 160),
    alternates: {
      canonical: `${baseUrl}/works/${slug}`, 
    },
    openGraph: {
      title: work.title,
      description: work.synopsis,
      url: `${baseUrl}/works/${slug}`,
      siteName: "أصوات البرج",
      images: [
        {
          url: coverUrl, // إضافة الغلاف هنا ليظهر في ديسكورد وإكس
          width: 800,
          height: 1200,
        },
      ],
      type: "article",
    },
  };
}

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
    "comments": *[_type == "comment" && work._ref == ^._id && approved == true] | order(_createdAt desc)
  }`;
  
  return await client.fetch(query, { slug }, { next: { revalidate: 60 } });
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const work = await getWork(slug);

  if (!work) return notFound();

  const workRating = work.ratingWork || 0; 
  const translationRating = work.ratingTranslation || 0;
  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";
  const finalPdfUrl = work.pdfUrl; 

  // 2. إعداد كود البيانات المهيكلة (JSON-LD) وحل مشكلة التقييم الصفر
  const bookSchema: any = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": work.title,
    "description": work.synopsis,
    "author": { "@type": "Person", "name": work.author || "تابي ناجاتسوكي" },
    "image": coverUrl,
  };

  // لا نرسل التقييم لجوجل إلا إذا كان أكبر من صفر لتفادي الأخطاء الحمراء
  if (workRating > 0) {
    bookSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": workRating,
      "reviewCount": work.ratingCount || 1,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "الروايات", "item": `${baseUrl}/works` },
      { "@type": "ListItem", "position": 3, "name": work.title, "item": `${baseUrl}/works/${slug}` }
    ]
  };

  return (
    <main dir="rtl" className="bg-[#050505] text-gray-200 min-h-screen font-sans overflow-x-hidden">
      {/* حقن أكواد السيو */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* 3. مسار التنقل البصري (Visual Breadcrumbs) */}
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

              <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
                <div className="flex flex-col items-center md:items-start gap-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">تقييم القصة</span>
                  <div className="bg-zinc-900/50 p-2 md:p-3 rounded-xl border border-white/5 shadow-inner flex items-center gap-3">
                    <InteractiveRating initialRating={workRating} workId={work._id} fieldName="ratingWork" />
                    <div className="flex items-center gap-1 border-r border-white/10 pr-3 mr-1">
                        <span className="text-yellow-500 font-black text-lg">{workRating}</span>
                        <span className="text-gray-500 text-[10px] md:text-xs font-medium">(من {work.ratingCount || 0} تقييم)</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-px h-10 bg-white/10 hidden md:block mt-6" />

                <div className="flex flex-col items-center md:items-start gap-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">جودة الترجمة</span>
                  <div className="bg-zinc-900/50 p-2 md:p-3 rounded-xl border border-white/5 shadow-inner flex items-center gap-3">
                    <InteractiveRating initialRating={translationRating} workId={work._id} fieldName="ratingTranslation" />
                    <span className="text-blue-400 font-black text-lg border-r border-white/10 pr-3 mr-1">{translationRating}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                <ReaderButton slug={work.slug} />
                
                {finalPdfUrl ? (
                  <a href={finalPdfUrl} target="_blank" className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-white/10 w-full sm:w-auto shadow-xl active:scale-95">
                    <FaDownload className="text-lg" /> تحميل PDF
                  </a>
                ) : (
                  <p className="text-gray-500 text-xs italic">رابط التحميل قيد التجهيز..</p>
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
                <SpoilerSynopsis text={work.synopsis || "لا يوجد ملخص متاح حالياً."} isSpoiler={work.isSpoiler || false} />
              </div>
            </div>
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
                    <span className="text-white font-bold">{work.author || "غير معروف"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 flex flex-col items-center justify-between gap-6 border border-white/5">
                <div className="flex items-center gap-4 text-gray-400 font-bold text-sm">
                    <FaShareAlt className="text-blue-500" /> انشر العمل مع أصدقائك
                </div>
                <ShareButtons url={`${baseUrl}/works/${work.slug}`} title={work.title} />
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

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {work.comments?.length > 0 ? (
              work.comments.map((comment: any) => (
                <div key={comment._id} className="bg-white/5 p-6 rounded-2xl border border-white/5 transition-all hover:border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-blue-400 text-lg">{comment.name}</span>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-lg">
                      {new Date(comment._createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-md">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white/2 rounded-3xl border border-dashed border-white/10">
                <FaComments className="text-zinc-700 text-5xl mx-auto mb-4 opacity-20" />
                <p className="text-gray-500 italic">كن أول من يترك انطباعاً عن هذا العمل..</p>
              </div>
            )}
          </div>

          <div className="pt-10 border-t border-white/5">
            <CommentForm workId={work._id} />
          </div>
        </div>
      </section>
    </main>
  );
}