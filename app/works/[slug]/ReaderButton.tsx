"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaBookOpen } from "react-icons/fa";

const ModernReader = dynamic(() => import("@/components/ModernReader"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-[9999]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-blue-500 text-sm font-bold animate-pulse">جاري فتح الرواية...</p>
    </div>
  ),
});

export default function ReaderButton({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // إخفاء شريط الموقع الرئيسي عند القراءة
  useEffect(() => {
    const mainNavbar = document.querySelector('nav') || document.querySelector('header');
    if (mainNavbar instanceof HTMLElement) {
      mainNavbar.style.display = isOpen ? 'none' : '';
    }
    return () => { if (mainNavbar instanceof HTMLElement) mainNavbar.style.display = ''; };
  }, [isOpen]);

  // دالة لإغلاق القارئ يتم تمريرها للمكون الابن
  const handleClose = () => setIsOpen(false);

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
        // تم إزالة الحاوية الخارجية وزر الإغلاق القديم من هنا
        // يتم تمرير دالة onClose للمكون الجديد
        <ModernReader pdfUrl={pdfUrl} title={title} onClose={handleClose} />
      )}
    </>
  );
}