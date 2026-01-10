import { client } from "../../sanity.client";
import { notFound } from "next/navigation";
import ModernReader from "@/components/ModernReader";

export default async function ReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  // انتظار الـ params ضروري جداً في Next.js 15
  const { slug } = await params;

  const work = await client.fetch(
    `*[_type == "work" && slug.current == $slug][0]{
      title,
      "pdfUrl": coalesce(readerUrl, pdfFile.asset->url, downloadUrl)
    }`, { slug }, { cache: 'no-store' }
  );

  if (!work || !work.pdfUrl) return notFound();

  return (
    <div className="fixed inset-0 bg-[#050505] z-[99999] overflow-hidden">
      {/* نرسل فقط البيانات، لا نرسل وظائف (Functions) */}
      <ModernReader pdfUrl={work.pdfUrl} title={work.title} />
    </div>
  );
}