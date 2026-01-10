// app/reader/[slug]/page.tsx
import { client } from "@/sanity/lib/client"; // تأكد من مسار الكلينت عندك
import { notFound } from "next/navigation";
import ModernReader from "@/components/ModernReader";

async function getWork(slug: string) {
  const query = `*[_type == "work" && slug.current == $slug][0]{
    title,
    "pdfUrl": readerUrl // أو المنطق الذي تستخدمه لجلب الرابط
  }`;
  return await client.fetch(query, { slug });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getWork(slug);

  if (!work || !work.pdfUrl) return notFound();

  return (
    // حماية كاملة بملء الشاشة بخلفية سوداء صلبة
    <div className="fixed inset-0 bg-[#050505] z-[99999] overflow-hidden">
      <ModernReader 
        pdfUrl={work.pdfUrl} 
        title={work.title} 
        onClose={() => window.history.back()} 
      />
    </div>
  );
}