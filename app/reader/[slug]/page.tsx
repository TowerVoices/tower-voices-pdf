import { client } from "../../sanity.client";
import { urlFor } from "../../sanity.image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ModernReader from "@/components/ModernReader";
import { FaChevronLeft, FaArrowRight } from "react-icons/fa";

interface Props {
  params: Promise<{ slug: string }>;
}

// حل الـ 17 خطأ حرج (Metadata)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = await client.fetch(`*[_type == "work" && slug.current == $slug][0]{title, synopsis, "rawCover": cover}`, { slug });
  if (!work) return {};
  const coverUrl = work.rawCover ? urlFor(work.rawCover).url() : "";
  return {
    title: `قراءة ${work.title} | أصوات البرج`,
    description: work.synopsis?.slice(0, 160),
    openGraph: { images: [coverUrl] }
  };
}

export default async function ReaderPage({ params }: Props) {
  const { slug } = await params;
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
      {/* Breadcrumbs: لحل مشكلة الروابط الداخلية الضعيفة */}
      <nav dir="rtl" className="z-[100] px-4 py-2 border-b border-white/5 flex items-center gap-2 text-[10px] text-gray-500">
        <Link href="/works" className="hover:text-blue-500">المكتبة</Link>
        <FaChevronLeft className="text-[8px] opacity-30" />
        <Link href={`/works/${work.slug}`} className="hover:text-blue-500">{work.title}</Link>
        <FaChevronLeft className="text-[8px] opacity-30" />
        <span className="text-blue-400">وضع القراءة</span>
      </nav>

      {/* القارئ الفعلي: يأخذ المساحة المتبقية */}
      <div className="flex-1 relative">
        <ModernReader pdfUrl={work.pdfUrl} title={work.title} />
      </div>

      {/* Footer: يربط المجلدات ببعضها برمجياً */}
      <footer dir="rtl" className="z-[100] p-3 border-t border-white/5 flex justify-between items-center bg-[#080808]">
          <Link href={`/works/${work.slug}`} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1">
              <FaArrowRight /> العودة للمجلد
          </Link>
          {work.nextWork && (
              <Link href={`/reader/${work.nextWork.slug}`} className="text-[10px] text-blue-500 font-bold hover:underline">
                  المجلد التالي: {work.nextWork.title} ←
              </Link>
          )}
      </footer>
    </div>
  );
}