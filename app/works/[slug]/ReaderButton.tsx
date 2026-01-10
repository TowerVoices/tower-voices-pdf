"use client";
import { useState, useEffect } from "react"; // أضفنا useEffect للتحكم في العناصر الخارجية
import dynamic from "next/dynamic";
import { FaBookOpen, FaTimes } from "react-icons/fa";

const ModernReader = dynamic(() => import("@/components/ModernReader"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[9999] backdrop-blur-xl">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-blue-500 font-black tracking-widest animate-pulse">جاري تحضير تجربة القراءة...</p>
    </div>
  ),
});

export default function ReaderButton({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // كود برمي لإخفاء شريط الموقع (Navbar) عند فتح القارئ
  useEffect(() => {
    // نبحث عن أي عنصر nav أو عنصر يحمل كلاس navbar في الموقع
    const mainNavbar = document.querySelector('nav') || document.querySelector('header');
    
    if (mainNavbar instanceof HTMLElement) {
      if (isOpen) {
        mainNavbar.style.display = 'none'; // إخفاء البار تماماً عند القراءة
      } else {
        mainNavbar.style.display = ''; // استعادة البار عند الإغلاق
      }
    }

    // تنظيف التأثير عند مغادرة الصفحة لضمان عدم اختفاء البار للأبد
    return () => {
      if (mainNavbar instanceof HTMLElement) mainNavbar.style.display = '';
    };
  }, [isOpen]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 w-full sm:w-auto overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
        <FaBookOpen className="text-xl" /> قراءة الرواية الآن
      </button>

      {isOpen && (
        /* z-[9999] تضمن التغطية الكاملة حتى لو لم يختفِ البار برمجياً */
        <div className="fixed inset-0 z-[9999] bg-black overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[10000] pointer-events-none">
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