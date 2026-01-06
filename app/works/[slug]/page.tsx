import { client } from "../../sanity.client"; 
import { urlFor } from "../../sanity.image";
import { notFound } from "next/navigation";
import ShareButtons from "./ShareButtons";
import SpoilerSynopsis from "./SpoilerSynopsis"; 
import { 
  FaDownload, 
  FaExclamationTriangle, 
  FaBookOpen, 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar,
  FaShareAlt 
} from "react-icons/fa";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// دالة جلب العمل من Sanity بناءً على الـ Slug
async function getWork(slug: string) {
  const query = `*[_type == "work" && slug.current == $slug][0]{
    title,
    "cover": cover.asset->url,
    "rawCover": cover,
    author,
    tags,
    status,
    ratingWork,
    ratingTranslation,
    synopsis,
    isSpoiler,
    warning,
    downloadUrl
  }`;
  
  return await client.fetch(query, { slug });
}

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-zinc-600" />);
    }
  }
  return <div className="flex gap-1">{stars}</div>;
};

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const work = await getWork(slug);

  if (!work) return notFound();

  // جلب التقييمات مع قيم افتراضية إذا كانت فارغة في Sanity
  const workRating = work.ratingWork || 0; 
  const translationRating = work.ratingTranslation || 0;
  
  // تجهيز رابط الصورة (الخلفية المضببة والغلاف الرئيسي)
  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";

  return (
    <main dir="rtl" className="bg-[#050505] text-gray-200 min-h-screen font-sans">
      
      {/* 1. قسم الهيرو (Hero Section) */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 blur-sm opacity-30"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end w-full">
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-48 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src={coverUrl} 
                  alt={work.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            <div className="flex-1 text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                {work.tags?.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-blue-600/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-600/20 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
                <span className="bg-green-600/20 text-green-400 text-[10px] px-3 py-1 rounded-full border border-green-600/30">
                  {work.status}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase">{work.title}</h1>

              <div className="flex flex-col md:flex-row gap-6 mb-6 justify-center md:justify-start">
                <div className="flex flex-col items-center md:items-start gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-tighter text-right w-full">تقييم القصة</span>
                  <div className="flex items-center gap-2">
                    <StarRating rating={workRating} />
                    <span className="text-sm font-bold text-white">{workRating}</span>
                  </div>
                </div>
                <div className="w-[1px] h-8 bg-white/10 hidden md:block" />
                <div className="flex flex-col items-center md:items-start gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-tighter text-right w-full">جودة الترجمة</span>
                  <div className="flex items-center gap-2">
                    <StarRating rating={translationRating} />
                    <span className="text-sm font-bold text-white">{translationRating}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center md:justify-start">
                {work.downloadUrl && (
                  <a href={work.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                    <FaDownload /> تحميل الآن
                  </a>
                )}
                <button className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded-xl border border-white/5 transition-colors">
                  <FaExclamationTriangle className="text-pink-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. قسم المحتوى (Content) */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* صندوق التحذير الديناميكي */}
            {work.warning && (
              <div className="bg-red-950/30 border border-red-900/50 rounded-3xl p-6 md:p-8 flex items-start gap-4 backdrop-blur-sm">
                <div className="p-3 bg-red-600/20 rounded-xl border border-red-500/30 shrink-0">
                  <FaExclamationTriangle className="text-red-500 text-2xl" />
                </div>
                <div>
                  <h3 className="text-red-500 font-black text-lg mb-2 uppercase tracking-tighter">تحذير:</h3>
                  <p className="text-red-100/80 leading-relaxed font-bold">{work.warning}</p>
                </div>
              </div>
            )}

            {/* بطاقة الملخص مع ميزة إخفاء الحرق */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 text-blue-400 text-xl">
                <FaBookOpen /> <h2 className="font-bold text-white">الملخص</h2>
              </div>
              
              <SpoilerSynopsis 
                text={work.synopsis || "لا يوجد ملخص متاح حالياً."} 
                isSpoiler={work.isSpoiler || false} 
              />
            </div>

            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <span className="w-1 h-6 bg-blue-600 rounded-full hidden md:block"></span>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                    <FaShareAlt className="text-gray-400 text-lg" />
                  </div>
              </div>
              
              <div className="scale-100">
                <ShareButtons />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <h3 className="text-lg font-bold mb-6 text-white border-b border-white/5 pb-4 text-right">مراجعة سريعة</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">تقييم العمل</span>
                    <span className="text-yellow-500 font-bold">{workRating}/5</span>
                  </div>
                  <StarRating rating={workRating} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 text-sm">جودة الترجمة</span>
                    <span className="text-blue-400 font-bold">{translationRating}/5</span>
                  </div>
                  <StarRating rating={translationRating} />
                </div>
              </div>

              <div className="mt-8 bg-black/40 rounded-2xl p-4 text-[10px] text-center text-gray-500 leading-relaxed italic">
                "التقييمات بناءً على تصويت المتابعين ومعايير الفريق الفنية"
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}