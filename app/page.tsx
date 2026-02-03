import Link from "next/link";
import { Metadata } from "next"; 
import { client } from "./sanity.client"; 
import { urlFor } from "./sanity.image";  
import { 
  FaArrowRight,
  FaArrowLeft,
  FaMapMarkedAlt // استيراد أيقونة الخريطة للبنر الجديد
} from "react-icons/fa";

// 1. إعدادات السيو المحدثة للنطاق الجديد
export const metadata: Metadata = {
  title: "أصوات البرج | أرشيف ترجمة Re:Zero EX و Re:Zero IF بالعربية",
  description: "المكان الأول لأحدث ترجمات روايات ريزيرو. استكشف مسارات Re:Zero IF وقصص Re:Zero EX الجانبية، رواية الويب واللايت نوفل (Web & Light Novel) بأسلوب عربي فصيح.",
  keywords: [
    "ترجمة روايات ريزيرو", "Re:Zero novel translation", "Re:Zero IF Routes", "مسارات ريزيرو ماذا لو", 
    "Re:Zero EX", "رواية ويب ريزيرو", "Light Novel", "أصوات البرج", "Tower Voices"
  ],
  alternates: {
    canonical: "https://towerviews.online", 
  },
  openGraph: {
    title: "أصوات البرج: أرشيف ترجمة ريزيرو الرسمي",
    description: "استكشف كافة مسارات ريزيرو IF ومجلدات EX المترجمة باحترافية.",
    url: "https://towerviews.online",
    siteName: "أصوات البرج",
    locale: "ar_SA",
    type: "website",
  },
};

async function getLatestWorks() {
  const query = `*[_type == "work"] | order(priority asc, _createdAt desc) [0..3] {
    title,
    "slug": slug.current,
    cover,
    status,
    tags,
    priority
  }`;
  
  const data = await client.fetch(query, {}, { next: { revalidate: 60 } });
  return data;
}

export default async function HomePage() {
  const works = await getLatestWorks(); 

  return (
    <main dir="rtl" className="bg-[#050505] text-gray-200 min-h-screen font-sans selection:bg-blue-500/30">

      {/* 1. قسم الهيرو (Hero Section) */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-30 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#050505]/80 to-[#050505]" />
        
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            مشروع ترجمة معجبين غير ربحي
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white leading-tight">
            مرحبًا بكم في <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              أصوات البرج
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            نهدف إلى نقل النصوص بروحها الأصلية وبأسلوب عربي فصيح يحترم القارئ والمؤلف، لنصنع تجربة أدبية فريدة
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a href="#works" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2">
              استكشف الأعمال <FaArrowRight className="text-sm rotate-180" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. شبكة الأعمال */}
      <section id="works" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">أحدث الأعمال</h2>
            <p className="text-gray-500">استعرض آخر الترجمات التي تم العمل عليها</p>
          </div>
          <div className="h-[2px] flex-1 mx-8 bg-gradient-to-l from-zinc-800 to-transparent hidden md:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {works.map((work: any) => (
            <Link
              key={work.slug}
              href={`/works/${work.slug}`}
              className="group relative bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden transition-all duration-500 hover:border-blue-500/50 hover:-translate-y-2"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={urlFor(work.cover).width(600).url()} 
                  alt={`ترجمة ريزيرو: ${work.title}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full border border-white/10">
                  {work.status}
                </span>
              </div>

              <div className="p-6 relative">
                <div className="flex flex-wrap gap-1 mb-2">
                  {work.tags?.slice(0, 2).map((tag: string, i: number) => (
                    <span key={i} className="text-[9px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  {work.title}
                </h3>
                
                <div className="mt-4 flex items-center text-xs text-gray-500 gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  تصفح العمل <FaArrowRight className="text-[8px] rotate-180" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* --- الإضافة الجديدة: بنر خريطة البرج التفاعلي --- */}
        <div className="relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm group mb-16">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-all duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20 shadow-inner">
                <FaMapMarkedAlt className="text-blue-500 text-3xl" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">
                  هل تشعر بالضياع في أحداث ري زيرو؟
                </h3>
                <p className="text-gray-400 font-bold text-sm md:text-base leading-relaxed">
                  شاهد ترتيب المسارات الزمني من هنا وتتبع رحلة سوبارو وفيلهلم بدقة
                </p>
              </div>
            </div>

            <Link 
              href="/timeline" 
              className="group/btn flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] whitespace-nowrap"
            >
              شاهد الخريطة الزمنية
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3. زر شاهد المزيد */}
        <div className="text-center">
          <Link 
            href="/works" 
            className="inline-flex items-center gap-3 bg-zinc-900 border border-white/10 hover:border-blue-500/50 text-white px-10 py-4 rounded-2xl font-bold transition-all group"
          >
            استكشف كافة الأعمال 
            <FaArrowLeft className="text-blue-500 group-hover:-translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>
      
      {/* 5. الفوتر */}
      <footer className="border-t border-white/5 py-12 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-2xl font-black mb-4 text-white uppercase tracking-tighter">أصوات البرج</div>
          <p className="text-gray-500 text-sm mb-8 italic">مشروع ترجمة مستقل من المعجبين وإلى المعجبين - 2026</p>
          <div className="h-[1px] w-20 bg-blue-600 mx-auto" />
        </div>
      </footer>

    </main>
  );
}