"use client";
import { useState, useMemo } from "react";
import { Worker, Viewer, SpecialZoomLevel, ViewMode } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

import { motion, AnimatePresence } from "framer-motion";
import { FaRegFileAlt, FaThList, FaCog, FaTimes, FaPlus, FaMinus, FaSpinner } from "react-icons/fa";

interface ModernReaderProps {
    pdfUrl: string;
    title: string;
    onClose: () => void;
}

export default function ModernReader({ pdfUrl, title, onClose }: ModernReaderProps) {
  const [showControls, setShowControls] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); // حالة للتحميل

  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // معالجة الرابط لضمان التوافق مع الجسر البرمي (Proxy)
  const finalPdfUrl = useMemo(() => {
    if (!pdfUrl) return "";
    
    if (pdfUrl.includes('drive.google.com')) {
      // استخراج المعرف ID بدقة من روابط Drive المختلفة
      const driveId = pdfUrl.split('/d/')[1]?.split('/')[0] || pdfUrl.split('id=')[1]?.split('&')[0];
      
      if (driveId) {
        // نستخدم المسار الكامل للموقع لضمان عدم حدوث خطأ 404 في Vercel
        return `/api/pdf-proxy?id=${driveId}`;
      }
    }
    return pdfUrl; // إذا كان رابط Sanity أو رابط مباشر آخر
  }, [pdfUrl]);

  return (
    <div dir="rtl" className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col font-sans select-none">
      
      {/* 1. البار العلوي */}
      <header className="h-14 bg-black border-b border-white/5 flex items-center justify-between px-6 z-[10001] shadow-2xl">
          <button 
            onClick={() => setShowControls(!showControls)} 
            className={`p-2.5 rounded-xl transition-all ${showControls ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
          >
            <FaCog size={18} className={showControls ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
          </button>
          
          <h1 className="text-gray-200 font-bold text-xs md:text-sm truncate max-w-[200px] md:max-w-md text-center opacity-90">
            {title}
          </h1>

          <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-red-600/20 text-gray-400 hover:text-red-500 rounded-xl transition-all">
            <FaTimes size={18} />
          </button>
      </header>

      {/* 2. منطقة القراءة المركزية */}
      <main className="flex-1 relative overflow-hidden bg-[#111111] flex justify-center items-center p-2 md:p-6">
        
        {/* مؤشر التحميل  */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#111111] text-blue-500 gap-4">
            <FaSpinner className="animate-spin text-4xl" />
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">جاري جلب صفحات الرواية...</p>
          </div>
        )}

        <div className="h-full w-full max-w-5xl bg-white shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden rounded-sm">
            {/* مطابقة إصدار pdfjs-dist: 3.4.120 */}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                {finalPdfUrl && (
                  <Viewer
                    fileUrl={finalPdfUrl}
                    defaultScale={SpecialZoomLevel.PageWidth}
                    plugins={[defaultLayoutPluginInstance, zoomPluginInstance]}
                    viewMode={viewMode}
                    onDocumentLoad={() => setIsLoading(false)} // إخفاء التحميل عند نجاح العرض
                  />
                )}
            </Worker>
        </div>
      </main>

      {/* 3. لوحة التحكم الجانبية */}
      <AnimatePresence>
        {showControls && (
          <motion.aside 
            initial={{ x: 320, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: 320, opacity: 0 }}
            className="fixed top-14 right-0 bottom-0 w-72 bg-[#0d0d12]/98 backdrop-blur-3xl border-l border-white/5 p-8 flex flex-col gap-10 z-[10000] shadow-[-30px_0_60px_rgba(0,0,0,0.9)]"
          >
            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] px-1">التحكم في التكبير</h4>
              <div className="flex items-center justify-between bg-white/5 p-1.5 rounded-2xl border border-white/5">
                <ZoomOut>{(props) => <button onClick={props.onClick} className="p-4 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"><FaMinus /></button>}</ZoomOut>
                <div className="text-blue-500 font-black text-xs tracking-tighter">
                  <CurrentScale>{(props) => <>{Math.round(props.scale * 100)}%</>}</CurrentScale>
                </div>
                <ZoomIn>{(props) => <button onClick={props.onClick} className="p-4 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"><FaPlus /></button>}</ZoomIn>
              </div>
            </section>

            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] px-1">نمط الصفحات</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setViewMode(ViewMode.SinglePage)} 
                  className={`p-4 rounded-2xl flex flex-col items-center gap-3 text-[10px] border transition-all ${viewMode === ViewMode.SinglePage ? "bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/30" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaRegFileAlt size={20}/> صفحة
                </button>
                <button 
                  onClick={() => setViewMode(undefined)} 
                  className={`p-4 rounded-2xl flex flex-col items-center gap-3 text-[10px] border transition-all ${viewMode === undefined ? "bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/30" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaThList size={20}/> مستمر
                </button>
              </div>
            </section>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}