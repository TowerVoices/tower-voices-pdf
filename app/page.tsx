import Link from "next/link";
import { Metadata } from "next"; 
import { client } from "./sanity.client"; 
import { urlFor } from "./sanity.image";  
import { 
  FaArrowRight,
  FaArrowLeft,
  FaMapSigns,
  FaBook
} from "react-icons/fa";

// 1. إعدادات السيو الشاملة (Bilingual, IF & EX Routes)
export const metadata: Metadata = {
  title: "ترجمة Re:Zero EX و Re:Zero IF بالعربية (IF & EX Routes Archive) | أصوات البرج",
  description: "المكتبة الكاملة لترجمة روايات Re:Zero EX الجانبية ومسارات Re:Zero IF البديلة (ماذا لو). استمتع بقراءة رواية الويب واللايت نوفل بأسلوب احترافي.",
  keywords: [
    "Re:Zero IF Routes", "ترجمة ريزيرو IF", "Re:Zero EX translation", "مسارات ماذا لو ريزيرو",
    "رواية ويب ريزيرو", "Re:Zero Web Novel Arabic", "أصوات البرج", "Tower Voices"
  ],
  alternates: {
    canonical: "https://tower-voices-pdf.vercel.app/works", 
  },
  openGraph: {
    title: "أرشيف ريزيرو الشامل: Re:Zero EX & IF Routes Archive",
    description: "كل ما تحتاجه من ترجمات Re:Zero EX و IF المترجمة باحترافية وبشكل فصيح.",
    url: "https://tower-voices-pdf.vercel.app/works",
    siteName: "أصوات البرج",
    locale: "ar_SA",
    type: "website",
  },
};

async function getLatestWorks() {
  const query = `*[_type == "work"] | order(priority asc, _createdAt desc) {
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

      {/* 1. قسم الهيرو (Hero Section) - تم تحسينه لخدمة السيو */}
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
            Re:Zero Translation & IF Routes Project
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white leading-tight">
            أرشيف روايات <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Re:Zero IF & EX
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            المكان الأول لترجمة مسارات "ماذا لو" (IF Routes) ومجلدات EX الجانبية بروح النص الأصلي وأسلوب عربي فصيح.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a href="#works" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2">
              استكشف المسارات <FaArrowRight className="text-sm rotate-180" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. أزرار التصنيفات السريعة لزيادة قوة الأرشفة */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Re:Zero IF Routes', 'Re:Zero EX', 'Web Novel', 'Light Novel'].map((cat) => (
            <div key={cat} className="bg-zinc-900/90 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex items-center justify-center gap-3 hover:border-blue-500/30 transition-all group">
              <FaMapSigns className="text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-gray-200 tracking-wider uppercase">{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. شبكة الأعمال (الأرشيف الكامل) */}
      <section id="works" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">الأرشيف الكامل | Complete Archive</h2>
            <p className="text-gray-500">استعرض كافة مسارات IF ومجلدات EX المترجمة</p>
          </div>
          <div className="h-[2px] flex-1 mx-8 bg-gradient-to-l from-zinc-800 to-transparent hidden md:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {works.map((work: any) => (
            <Link
              key={work.slug}
              href={`/works/${work.slug}`}
              className="group relative bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden transition-all duration-500 hover:border-blue-500/50 hover:-translate-y-2"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={urlFor(work.cover).width(600).url()} 
                  alt={`ترجمة رواية ريزيرو Re:Zero EX / IF: ${work.title}`} // تحسين السيو عبر Alt Text
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

                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                  {work.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* 4. فقرة السيو الثنائية لتقوية الكلمات المفتاحية */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-10 text-right md:text-right">
          <div>
            <h4 className="text-blue-500 font-bold mb-4">لماذا مسارات ريزيرو ماذا لو؟</h4>
            <p className="text-gray-500 text-xs leading-loose">
              نحن نهتم بتقديم **مسارات ريزيرو** (IF Routes) مثل مسار الكسل والغرور وغيرها، بالإضافة إلى روايات **Re:Zero EX** الجانبية، لضمان حصول القارئ العربي على التجربة الكاملة لعالم ريزيرو المترجم.
            </p>
          </div>
          <div dir="ltr" className="text-left">
            <h4 className="text-blue-500 font-bold mb-4">Re:Zero Novel Translation Project</h4>
            <p className="text-gray-600 text-[10px] leading-loose">
              Our archive includes high-quality Arabic translations for **Re:Zero IF stories** and **Re:Zero EX light novels**. We aim to bridge the gap between English and Arabic fans by providing the best reading experience.
            </p>
          </div>
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