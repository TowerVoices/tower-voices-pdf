"use client";
import { useState } from "react";
import { Worker, Viewer, SpecialZoomLevel, ViewMode } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaRegFileAlt, FaThList, FaArrowsAltH, 
  FaArrowsAltV, FaExpand, FaCompress, FaTools
} from "react-icons/fa";

export default function ModernReader({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [showControls, setShowControls] = useState(false); // تبدأ اللوحة مخفية لتجربة نظيفة جداً
  const [scaling, setScaling] = useState<SpecialZoomLevel | number>(SpecialZoomLevel.PageWidth);
  const [viewMode, setViewMode] = useState<ViewMode | undefined>(undefined);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div dir="rtl" className="fixed inset-0 z-[150] bg-[#050505] overflow-hidden flex">
      
      {/* لوحة التحكم الجانبية العائمة (تظهر فقط عند الحاجة) */}
      <AnimatePresence>
        {showControls && (
          <motion.aside 
            initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
            className="fixed top-0 right-0 h-full w-72 bg-[#0d0d12]/95 backdrop-blur-2xl border-l border-white/5 p-8 flex flex-col gap-10 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] z-[200]"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
               <h3 className="text-blue-500 text-[11px] font-black uppercase flex items-center gap-2 tracking-widest">
                  <FaTools /> إعدادات القراءة
               </h3>
               <button onClick={() => setShowControls(false)} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                  <FaCompress size={18} />
               </button>
            </div>

            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">نمط العرض</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setViewMode(ViewMode.SinglePage)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === ViewMode.SinglePage ? "bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20 text-white" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaRegFileAlt size={20}/> صفحة
                </button>
                <button 
                  onClick={() => setViewMode(undefined)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === undefined ? "bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20 text-white" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaThList size={20}/> مستمر
                </button>
              </div>
            </section>

            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">التكبير</h4>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setScaling(SpecialZoomLevel.PageWidth)}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-[11px] border transition-all ${scaling === SpecialZoomLevel.PageWidth ? "bg-zinc-800 border-white/10 text-white" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaArrowsAltH className="text-blue-500" /> عرض الشاشة
                </button>
                <button 
                  onClick={() => setScaling(SpecialZoomLevel.ActualSize)}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-[11px] border transition-all ${scaling === SpecialZoomLevel.ActualSize ? "bg-zinc-800 border-white/10 text-white" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaArrowsAltV className="text-blue-500" /> الحجم الفعلي
                </button>
              </div>
            </section>
            
            <div className="mt-auto border-t border-white/5 pt-6 text-center">
                <p className="text-[10px] text-gray-600 italic leading-relaxed">
                    يقرأ الآن: <br/> <span className="text-gray-400 font-bold">{title}</span>
                </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* منطقة القراءة الفاعلة - تأخذ الشاشة بالكامل */}
      <main className="flex-1 h-full w-full relative">
        {/* تحديث الرابط لإصلاح Invalid PDF structure */}
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            defaultScale={scaling}
            plugins={[defaultLayoutPluginInstance]}
            viewMode={viewMode}
          />
        </Worker>

        {/* زر عائم صغير جداً للإعدادات - لا يشتت الانتباه */}
        {!showControls && (
          <button 
            onClick={() => setShowControls(true)}
            className="fixed bottom-8 right-8 p-4 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-full shadow-2xl backdrop-blur-md transition-all z-[160] border border-white/10 group"
          >
            <FaExpand size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        )}
      </main>
    </div>
  );
}