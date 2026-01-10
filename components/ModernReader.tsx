"use client";
import { useState, useMemo } from "react";
import { Worker, Viewer, SpecialZoomLevel, ViewMode } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

import { motion, AnimatePresence } from "framer-motion";
import { FaRegFileAlt, FaThList, FaCog, FaTimes, FaPlus, FaMinus } from "react-icons/fa";

interface ModernReaderProps {
    pdfUrl: string;
    title: string;
    onClose: () => void;
}

export default function ModernReader({ pdfUrl, title, onClose }: ModernReaderProps) {
  const [showControls, setShowControls] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode | undefined>(undefined);

  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // دالة معالجة الرابط لضمان الاستقرار مع Google Drive
  const finalPdfUrl = useMemo(() => {
    if (pdfUrl.includes('drive.google.com')) {
      // استخراج المعرف (ID) من الرابط العادي
      const driveIdMatch = pdfUrl.match(/\/d\/(.+?)\//) || pdfUrl.match(/id=(.+?)(&|$)/);
      const driveId = driveIdMatch ? driveIdMatch[1] : null;
      
      // إذا وجدنا المعرف، نمرره عبر الجسر البرمي لتجنب CORS
      return driveId ? `/api/pdf-proxy?id=${driveId}` : pdfUrl;
    }
    return pdfUrl;
  }, [pdfUrl]);

  return (
    <div dir="rtl" className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col font-sans select-none">
      
      <header className="h-14 bg-black border-b border-white/5 flex items-center justify-between px-6 z-[10001]">
          <button 
            onClick={() => setShowControls(!showControls)} 
            className={`p-2.5 rounded-xl transition-all ${showControls ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400"}`}
          >
            <FaCog size={18} className={showControls ? "rotate-90 transition-transform" : ""} />
          </button>
          
          <h1 className="text-gray-200 font-bold text-xs truncate max-w-md text-center">
            {title}
          </h1>

          <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-red-600/20 text-gray-400 rounded-xl transition-all">
            <FaTimes size={18} />
          </button>
      </header>

      <main className="flex-1 relative overflow-hidden bg-[#111111] flex justify-center p-4">
        <div className="h-full w-full max-w-4xl bg-white shadow-2xl overflow-hidden rounded-sm border border-black/10">
            {/* توحيد الإصدار 3.4.120 لضمان التوافق */}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <Viewer
                    fileUrl={finalPdfUrl}
                    defaultScale={SpecialZoomLevel.PageWidth}
                    plugins={[defaultLayoutPluginInstance, zoomPluginInstance]}
                    viewMode={viewMode}
                />
            </Worker>
        </div>
      </main>

      <AnimatePresence>
        {showControls && (
          <motion.aside 
            initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
            className="fixed top-14 right-0 bottom-0 w-72 bg-[#0d0d12]/95 backdrop-blur-3xl border-l border-white/5 p-8 flex flex-col gap-10 z-[10000] shadow-[-20px_0_60px_rgba(0,0,0,0.8)]"
          >
            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">التحكم في التكبير</h4>
              <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl border border-white/5">
                <ZoomOut>{(props) => <button onClick={props.onClick} className="p-4 hover:bg-white/10 rounded-xl text-gray-400"><FaMinus /></button>}</ZoomOut>
                <div className="text-blue-500 font-black text-xs"><CurrentScale>{(props) => <>{Math.round(props.scale * 100)}%</>}</CurrentScale></div>
                <ZoomIn>{(props) => <button onClick={props.onClick} className="p-4 hover:bg-white/10 rounded-xl text-gray-400"><FaPlus /></button>}</ZoomIn>
              </div>
            </section>

            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">نمط الصفحات</h4>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setViewMode(ViewMode.SinglePage)} className={`p-4 rounded-2xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === ViewMode.SinglePage ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-transparent text-gray-500"}`}><FaRegFileAlt size={20}/> صفحة</button>
                <button onClick={() => setViewMode(undefined)} className={`p-4 rounded-2xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === undefined ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-transparent text-gray-500"}`}><FaThList size={20}/> مستمر</button>
              </div>
            </section>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}