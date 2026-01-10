"use client";
import { useState } from "react";
import { Worker, Viewer, SpecialZoomLevel, ViewMode } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaRegFileAlt, FaThList, FaArrowsAltH, 
  FaArrowsAltV, FaExpand, FaCompress, FaInfoCircle
} from "react-icons/fa";

export default function ModernReader({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [showControls, setShowControls] = useState(true);
  const [scaling, setScaling] = useState<SpecialZoomLevel | number>(SpecialZoomLevel.PageWidth);
  const [viewMode, setViewMode] = useState<ViewMode | undefined>(undefined);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div dir="rtl" className="fixed inset-0 z-[100] bg-[#050505] flex flex-col md:flex-row overflow-hidden text-gray-200 font-sans">
      
      {/* لوحة التحكم الجانبية (تم تحسين الألوان والخطوط) */}
      <AnimatePresence>
        {showControls && (
          <motion.aside 
            initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }}
            className="w-full md:w-72 bg-[#0d0d12] border-l border-white/5 p-6 flex flex-col gap-8 shadow-2xl z-20"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <div className="flex items-center gap-2 text-blue-500">
                  <FaInfoCircle />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">لوحة التحكم</span>
               </div>
              <button onClick={() => setShowControls(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                <FaCompress/>
              </button>
            </div>

            {/* أنماط القراءة */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">نمط القراءة</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setViewMode(ViewMode.SinglePage)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === ViewMode.SinglePage ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaRegFileAlt className="text-base"/> صفحة واحدة
                </button>
                <button 
                  onClick={() => setViewMode(undefined)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === undefined ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaThList className="text-base"/> مستمر
                </button>
              </div>
            </section>

            {/* أحجام العرض */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">حجم العرض</h4>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setScaling(SpecialZoomLevel.PageWidth)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-[11px] font-medium transition-all border ${scaling === SpecialZoomLevel.PageWidth ? "bg-zinc-800 border-white/10 text-white" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaArrowsAltH className="text-blue-500" /> ملائمة عرض الشاشة
                </button>
                <button 
                  onClick={() => setScaling(SpecialZoomLevel.ActualSize)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-[11px] font-medium transition-all border ${scaling === SpecialZoomLevel.ActualSize ? "bg-zinc-800 border-white/10 text-white" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaArrowsAltV className="text-blue-500" /> الحجم الفعلي للملف
                </button>
              </div>
            </section>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* منطقة عرض المحتوى */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* شريط العنوان العلوي (مطلوب: العنوان أعلى اليمين) */}
        <header className="w-full bg-[#0d0d12]/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between z-10">
          <h1 className="text-sm md:text-base font-bold text-white pr-4 border-r-2 border-blue-600 leading-none">
            {title}
          </h1>
          {!showControls && (
            <button 
              onClick={() => setShowControls(true)}
              className="p-2 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600/30 transition-all ml-4"
              title="إظهار الإعدادات"
            >
              <FaExpand />
            </button>
          )}
        </header>

        {/* منطقة القارئ الفاعلة */}
        <main className="flex-1 bg-[#050505] overflow-hidden p-2 md:p-4">
          <div className="w-full h-full rounded-lg overflow-hidden border border-white/5 bg-black/40 shadow-inner">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                defaultScale={scaling}
                plugins={[defaultLayoutPluginInstance]}
                viewMode={viewMode}
              />
            </Worker>
          </div>
        </main>
      </div>
    </div>
  );
}