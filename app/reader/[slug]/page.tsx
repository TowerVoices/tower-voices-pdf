import { client } from "../../sanity.client";
import { notFound } from "next/navigation";
import ModernReader from "@/components/ModernReader";

export default async function DedicatedReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // الربط مع الاستوديو: جلب الرابط المباشر أو الملف المرفوع
  const work = await client.fetch(
    `*[_type == "work" && slug.current == $slug][0]{
      title,
      "pdfUrl": coalesce(readerUrl, pdfFile.asset->url, downloadUrl)
    }`, { slug }
  );

  if (!work || !work.pdfUrl) return notFound();

  return (
    <div className="fixed inset-0 bg-[#050505] z-[99999] overflow-hidden">
      <ModernReader pdfUrl={work.pdfUrl} title={work.title} onClose={() => window.history.back()} />
    </div>
  );
}