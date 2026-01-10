"use client";
import { useState } from "react";
import { Worker, Viewer, SpecialZoomLevel, ViewMode } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { zoomPlugin } from "@react-pdf-viewer/zoom"; // استيراد إضافة الزووم

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

import { motion, AnimatePresence } from "framer-motion";
import { 
  FaRegFileAlt, FaThList, FaCog, FaTimes, FaPlus, FaMinus
} from "react-icons/fa";

interface ModernReaderProps {
    pdfUrl: string;
    title: string;
    onClose: () => void;
}

export default function ModernReader({ pdfUrl, title, onClose }: ModernReaderProps) {
  const [showControls, setShowControls] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode | undefined>(undefined);

  // إعداد الإضافات
  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div dir="rtl" className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col font-sans">
      
      {/* 1. البار العلوي الثابت */}
      <header className="h-16 bg-black border-b border-white/10 flex items-center justify-between px-6 z-20 shadow-xl">
          <button onClick={() => setShowControls(true)} className="p-3 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-xl transition-all">
            <FaCog size={18} />
          </button>
          
          <h1 className="text-white font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md text-center">
            {title}
          </h1>

          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-red-600/80 text-gray-400 hover:text-white rounded-xl transition-all">
            <FaTimes size={18} />
          </button>
      </header>

      {/* 2. منطقة القراءة (توسيط الصفحة وجعلها بيضاء) */}
      <main className="flex-1 relative overflow-hidden bg-[#151515] flex justify-center p-4">
        {/* حاوية الـ PDF: خلفية بيضاء وعرض محدد لمطابقة الملف */}
        <div className="h-full w-full max-w-5xl bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-sm">
            {/* مطابقة الإصدار 3.4.120 لحل الخطأ الأحمر */}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <Viewer
                    fileUrl={pdfUrl}
                    initialScale={SpecialZoomLevel.PageWidth}
                    plugins={[defaultLayoutPluginInstance, zoomPluginInstance]}
                    viewMode={viewMode}
                />
            </Worker>
        </div>
      </main>

      {/* 3. لوحة التحكم الجانبية */}
      <AnimatePresence>
        {showControls && (
          <motion.aside 
            initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
            className="fixed top-16 right-0 bottom-0 w-80 bg-[#0d0d12]/98 backdrop-blur-3xl border-l border-white/5 p-8 flex flex-col gap-10 z-[30] shadow-[-20px_0_60px_rgba(0,0,0,0.8)]"
          >
            {/* أزرار الزووم الاحترافية */}
            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">التحكم في التكبير</h4>
              <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl">
                <ZoomOut>{(props) => (
                  <button onClick={props.onClick} className="p-4 hover:bg-white/10 rounded-xl text-white transition-all"><FaMinus /></button>
                )}</ZoomOut>
                
                <div className="text-blue-400 font-black text-xs">
                  <CurrentScale>{(props) => <>{Math.round(props.scale * 100)}%</>}</CurrentScale>
                </div>

                <ZoomIn>{(props) => (
                  <button onClick={props.onClick} className="p-4 hover:bg-white/10 rounded-xl text-white transition-all"><FaPlus /></button>
                )}</ZoomIn>
              </div>
            </section>

            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">نمط الصفحات</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setViewMode(ViewMode.SinglePage)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === ViewMode.SinglePage ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaRegFileAlt size={20}/> صفحة واحدة
                </button>
                <button 
                  onClick={() => setViewMode(undefined)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === undefined ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
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