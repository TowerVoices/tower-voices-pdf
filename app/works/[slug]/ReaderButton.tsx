"use client";
import { useState } from "react";
import dynamic from "next/dynamic"; // استيراد المحرك الديناميكي
import { FaBookOpen, FaTimes } from "react-icons/fa";

// استدعاء القارئ بشكل ديناميكي مع تعطيل SSR (الرندر من جهة السيرفر)
// هذا هو الحل الذي يمنع ظهور خطأ "Can't resolve 'canvas'" في Vercel
const ModernReader = dynamic(() => import("@/components/ModernReader"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[110] backdrop-blur-xl">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
      <p className="text-blue-500 font-black tracking-widest animate-pulse">جاري تحضير تجربة القراءة...</p>
    </div>
  ),
});

export default function ReaderButton({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* الزر الرئيسي بتصميم يتناسب مع فخامة "أصوات البرج" */}
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 w-full sm:w-auto overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
        <FaBookOpen className="text-xl" /> قراءة الرواية الآن
      </button>

      {/* المنبثق الاحترافي (Overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col">
          {/* شريط علوي بسيط للتحكم في الإغلاق */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[120] pointer-events-none">
            <button 
              onClick={() => setIsOpen(false)}
              className="pointer-events-auto bg-white/5 hover:bg-red-600/20 p-4 rounded-full text-white backdrop-blur-xl transition-all border border-white/10 group"
              title="إغلاق القارئ"
            >
              <FaTimes size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
          
          <ModernReader pdfUrl={pdfUrl} title={title} />
        </div>
      )}
    </>
  );
}