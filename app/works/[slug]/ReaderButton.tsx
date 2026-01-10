"use client";
import { useState } from "react";
import ModernReader from "@/components/ModernReader";
import { FaBookOpen, FaTimes } from "react-icons/fa";

export default function ReaderButton({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* الزر الرئيسي في صفحة الرواية */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 w-full sm:w-auto"
      >
        <FaBookOpen className="text-xl" /> قراءة الرواية الآن
      </button>

      {/* المنبثق (Overlay) الذي يعرض القارئ بكامل الشاشة */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* زر إغلاق القارئ والعودة للموقع */}
          <button 
            onClick={() => setIsOpen(false)}
            className="fixed top-6 left-6 z-[110] bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-md transition-all border border-white/10"
            title="إغلاق القارئ"
          >
            <FaTimes size={24} />
          </button>
          
          <ModernReader pdfUrl={pdfUrl} title={title} />
        </div>
      )}
    </>
  );
}