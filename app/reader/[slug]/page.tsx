import { client } from "../../sanity.client";
import { urlFor } from "../../sanity.image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ModernReader from "@/components/ModernReader";
import { FaChevronLeft, FaArrowRight, FaHome, FaBook } from "react-icons/fa";

interface Props {
  params: Promise<{ slug: string }>;
}

const baseUrl = "https://towervoices.online";

/**
 * 1. توليد Metadata مطورة: تم حذف التكرار لحل مشكلة الطول (96 حرفاً)
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const work = await client.fetch(
    `*[_type == "work" && slug.current == $slug][0]{ 
      title, synopsis, "rawCover": cover, tags, author 
    }`, 
    { slug }
  );
  
  // حذف اسم الموقع من عنوان الخطأ لتجنب التكرار
  if (!work) return { title: "الصفحة غير موجودة" };
  
  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";
  const description = work.synopsis?.slice(0, 160) || "قراءة أحدث روايات ريزيرو المترجمة حصرياً على أصوات البرج.";

  return {
    // التعديل الأساسي: حذفنا "| أصوات البرج" يدوياً لأنها ستضاف من الـ Layout
    title: `قراءة ${work.title}`, 
    description: description,
    
    // استهداف مكثف للكلمات المفتاحية
    keywords: [
      work.title, work.author, "rezero", "Re Zero", "re:zero", "re zero novel", 
      "rezero light novel", "ريزيرو", "ري زيرو", "رواية ري زيرو", "رواية ريزيرو", 
      "رواية خفيفة", "ترجمة ريزيرو", "أصوات البرج", "Tower Voices", "روايات مترجمة", 
      "ارك", "arc", "ex", "مجلد", "قراءة اونلاين",
      ...(work.tags || [])
    ],
    
    // حل مشكلة "Canonical outside of head"
    alternates: { 
      canonical: `${baseUrl}/reader/${slug}` 
    },

    // حل مشكلة Twitter card incomplete بإضافة الحساب الرسمي
    twitter: { 
      card: "summary_large_image",
      title: `قراءة ${work.title} - أصوات البرج`,
      description: description,
      images: [coverUrl],
      site: "@TowerVoices",
      creator: "@TowerVoices"
    },

    openGraph: {
      title: `قراءة ${work.title} - أصوات البرج`,
      description: description,
      url: `${baseUrl}/reader/${slug}`,
      siteName: "أصوات البرج",
      images: [{ url: coverUrl, width: 800, height: 1200 }],
      type: "article",
    }
  };
}

export default async function ReaderPage({ params }: Props) {
  const { slug } = await params;

  // جلب البيانات مع روابط التنقل لتقليل الصفحات اليتيمة
  const work = await client.fetch(
    `*[_type == "work" && slug.current == $slug][0]{
      title, "slug": slug.current,
      "pdfUrl": coalesce(readerUrl, pdfFile.asset->url, downloadUrl),
      "nextWork": nextWork->{ title, "slug": slug.current }
    }`, { slug }, { cache: 'no-store' }
  );

  if (!work || !work.pdfUrl) return notFound();

  return (
    <div className="flex flex-col h-screen bg-[#050505] overflow-hidden">
      
      {/* 2. نظام المسارات (Breadcrumbs): يعزز الربط الداخلي */}
      <nav dir="rtl" className="z-[100] px-6 py-3 border-b border-white/5 bg-[#080808]/90 backdrop-blur-md flex items-center gap-3 text-[10px] md:text-[11px] font-bold text-gray-500">
        <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
          <FaHome className="text-blue-500" /> الرئيسية
        </Link>
        <FaChevronLeft className="text-[8px] opacity-20" />
        <Link href="/works" className="hover:text-white transition-colors">المكتبة</Link>
        <FaChevronLeft className="text-[8px] opacity-20" />
        <Link href={`/works/${work.slug}`} className="hover:text-blue-400 transition-colors truncate max-w-[150px]">
          {work.title}
        </Link>
        <FaChevronLeft className="text-[8px] opacity-20" />
        <span className="text-blue-500">وضع القراءة</span>
      </nav>

      <main className="flex-1 relative overflow-hidden">
        <ModernReader pdfUrl={work.pdfUrl} title={work.title} />
      </main>

      {/* 4. تذييل التنقل: يربط المجلدات ببعضها */}
      <footer dir="rtl" className="z-[100] p-4 border-t border-white/5 bg-[#080808] flex flex-row justify-between items-center">
          <Link href={`/works/${work.slug}`} className="text-[10px] md:text-[11px] text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
              <FaArrowRight className="text-[10px]" /> العودة لتفاصيل المجلد
          </Link>

          <div className="flex items-center gap-4">
            {work.nextWork ? (
                <Link href={`/reader/${work.nextWork.slug}`} className="bg-blue-600/10 text-blue-400 border border-blue-600/20 px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all">
                    المجلد التالي: {work.nextWork.title} ←
                </Link>
            ) : (
                <Link href="/works" className="text-[10px] md:text-[11px] text-gray-400 hover:text-blue-400 flex items-center gap-2">
                    <FaBook /> تصفح أعمال أخرى
                </Link>
            )}
          </div>
      </footer>
    </div>
  );
}