"use client";
import { useState, useMemo } from "react";
// استيراد useRouter للتعامل مع الإغلاق برمجياً داخل العميل
import { useRouter } from "next/navigation"; 
import { Worker, Viewer, SpecialZoomLevel, ViewMode } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

// استيراد الأنماط الأساسية فقط
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

import { motion, AnimatePresence } from "framer-motion";
import { FaRegFileAlt, FaThList, FaCog, FaTimes, FaPlus, FaMinus, FaSpinner } from "react-icons/fa";

interface ModernReaderProps {
    pdfUrl: string;
    title: string;
    onClose?: () => void; // جعلناها اختيارية لحل تعارض الـ Props في السيرفر
}

export default function ModernReader({ pdfUrl, title, onClose }: ModernReaderProps) {
  const router = useRouter(); 
  const [showControls, setShowControls] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;

  // دالة الإغلاق الذكية: تستخدم الوظيفة الممرة أو تعود للخلف تلقائياً
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back(); 
    }
  };

  const finalPdfUrl = useMemo(() => {
    if (!pdfUrl) return "";
    if (pdfUrl.includes('drive.google.com')) {
      const driveId = pdfUrl.split('/d/')[1]?.split('/')[0] || pdfUrl.split('id=')[1]?.split('&')[0];
      return driveId ? `/api/pdf-proxy?id=${driveId}` : pdfUrl;
    }
    return pdfUrl;
  }, [pdfUrl]);

  return (
    <div dir="rtl" className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col font-sans select-none overflow-hidden text-right">
      
      {/* 1. حقن تنسيقات CSS لقتل الخطوط والظلال البيضاء نهائياً */}
      <style dangerouslySetInnerHTML={{ __html: `
        .rpv-core__page-container {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important; 
        }
        .rpv-core__canvas-layer {
          box-shadow: none !important;
          border: none !important;
        }
        .rpv-core__inner-pages, 
        .rpv-core__viewer {
          background-color: transparent !important;
        }
        .rpv-core__viewer::-webkit-scrollbar {
          width: 0;
        }
      `}} />

      {/* البار العلوي الداكن */}
      <header className="h-14 bg-black/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-[10001]">
          <button 
            onClick={() => setShowControls(!showControls)} 
            className={`p-2.5 rounded-xl transition-all ${showControls ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
          >
            <FaCog size={18} className={showControls ? "rotate-90 transition-transform duration-300" : ""} />
          </button>
          
          <h1 className="text-gray-300 font-bold text-[10px] md:text-xs truncate max-w-[150px] md:max-w-md text-center opacity-80">
            {title}
          </h1>

          {/* زر الإغلاق المرتبط بالدالة الذكية */}
          <button onClick={handleClose} className="p-2.5 bg-white/5 hover:bg-red-600/20 text-gray-400 hover:text-red-500 rounded-xl transition-all">
            <FaTimes size={18} />
          </button>
      </header>

      {/* منطقة القراءة المركزية */}
      <main className="flex-1 relative bg-[#0a0a0a] flex justify-center items-start overflow-y-auto pt-4 pb-10">
        
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            <p className="text-[10px] text-gray-600 tracking-widest font-bold font-sans">جاري استحضار الرواية...</p>
          </div>
        )}

        <div className="w-full max-w-4xl bg-transparent overflow-hidden relative">
            {/* استخدام نسخة Worker 3.4.120 لضمان التوافق */}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                {finalPdfUrl && (
                  <Viewer
                    fileUrl={finalPdfUrl}
                    defaultScale={SpecialZoomLevel.PageWidth}
                    plugins={[zoomPluginInstance]} 
                    viewMode={viewMode}
                    onDocumentLoad={() => setIsLoading(false)}
                  />
                )}
            </Worker>
        </div>
      </main>

      {/* اللوحة الجانبية الأنيقة */}
      <AnimatePresence>
        {showControls && (
          <motion.aside 
            initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }}
            className="fixed top-14 right-0 bottom-0 w-72 bg-[#0d0d12]/98 backdrop-blur-3xl border-l border-white/5 p-8 flex flex-col gap-10 z-[10000] shadow-2xl"
          >
            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] px-1 text-right">التحكم في التكبير</h4>
              <div className="flex items-center justify-between bg-white/5 p-1.5 rounded-2xl border border-white/5">
                <ZoomOut>{(props) => <button onClick={props.onClick} className="p-4 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"><FaMinus /></button>}</ZoomOut>
                <div className="text-blue-500 font-black text-xs">
                  <CurrentScale>{(props) => <>{Math.round(props.scale * 100)}%</>}</CurrentScale>
                </div>
                <ZoomIn>{(props) => <button onClick={props.onClick} className="p-4 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"><FaPlus /></button>}</ZoomIn>
              </div>
            </section>

            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] px-1 text-right">نمط الصفحات</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => setViewMode(ViewMode.SinglePage)} 
                    className={`p-4 rounded-2xl flex flex-col items-center gap-3 text-[10px] border transition-all ${viewMode === ViewMode.SinglePage ? "bg-blue-600 border-blue-400 text-white shadow-lg" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                    <FaRegFileAlt size={20}/> صفحة
                </button>
                <button 
                    onClick={() => setViewMode(undefined)} 
                    className={`p-4 rounded-2xl flex flex-col items-center gap-3 text-[10px] border transition-all ${viewMode === undefined ? "bg-blue-600 border-blue-400 text-white shadow-lg" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
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