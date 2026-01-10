"use client";
import { useState } from "react";
// استيراد ViewMode بشكل صحيح
import { Worker, Viewer, SpecialZoomLevel, ViewMode } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaRegFileAlt, FaThList, FaArrowsAltH, 
  FaArrowsAltV, FaExpand, FaCompress
} from "react-icons/fa";

export default function ModernReader({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [showControls, setShowControls] = useState(true);
  const [scaling, setScaling] = useState<SpecialZoomLevel | number>(SpecialZoomLevel.PageWidth);
  
  // الإصلاح: استخدام undefined للوضع الافتراضي (المستمر) لأن "Vertical" غير موجودة في الـ Enum
  const [viewMode, setViewMode] = useState<ViewMode | undefined>(undefined);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div dir="rtl" className="fixed inset-0 z-50 bg-[#050505] flex flex-col md:flex-row overflow-hidden text-gray-200">
      
      {/* منطقة القراءة الفاعلة */}
      <div className="flex-1 relative flex justify-center items-start overflow-hidden bg-black/20 p-2 md:p-6">
        <div className="w-full h-full max-w-5xl shadow-2xl rounded-xl overflow-hidden border border-white/5">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfUrl}
              defaultScale={scaling}
              plugins={[defaultLayoutPluginInstance]}
              // تمرير القيمة الصحيحة للمكون
              viewMode={viewMode}
            />
          </Worker>
        </div>
      </div>

      {/* لوحة التحكم الجانبية */}
      <AnimatePresence>
        {showControls && (
          <motion.aside 
            initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }}
            className="w-full md:w-80 bg-[#0d0d12] border-r border-white/5 p-6 flex flex-col gap-8 shadow-2xl backdrop-blur-xl z-10"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="font-black text-white text-sm truncate">{title}</h2>
              <button onClick={() => setShowControls(false)} className="p-2 hover:bg-white/5 rounded-lg"><FaCompress/></button>
            </div>

            {/* التحكم في نمط القراءة */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">نمط القراءة</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setViewMode(ViewMode.SinglePage)}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === ViewMode.SinglePage ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/30" : "bg-white/5 border-transparent text-gray-500"}`}
                >
                  <FaRegFileAlt className="text-lg"/> صفحة واحدة
                </button>
                <button 
                  onClick={() => setViewMode(undefined)} // العودة للوضع الافتراضي المستمر
                  className={`p-3 rounded-2xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === undefined ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/30" : "bg-white/5 border-transparent text-gray-500"}`}
                >
                  <FaThList className="text-lg"/> مستمر
                </button>
              </div>
            </section>

            {/* التحكم في الحجم */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">حجم العرض</h4>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setScaling(SpecialZoomLevel.PageWidth)}
                  className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-bold transition-all border ${scaling === SpecialZoomLevel.PageWidth ? "bg-zinc-800 border-white/10 text-white" : "bg-white/5 border-transparent text-gray-500"}`}
                >
                  <FaArrowsAltH /> ملائمة العرض
                </button>
                <button 
                  onClick={() => setScaling(SpecialZoomLevel.ActualSize)}
                  className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-bold transition-all border ${scaling === SpecialZoomLevel.ActualSize ? "bg-zinc-800 border-white/10 text-white" : "bg-white/5 border-transparent text-gray-500"}`}
                >
                  <FaArrowsAltV /> الحجم الفعلي
                </button>
              </div>
            </section>
          </motion.aside>
        )}
      </AnimatePresence>

      {!showControls && (
        <button 
          onClick={() => setShowControls(true)}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 rounded-full text-white shadow-xl hover:scale-110 transition-transform z-30"
        >
          <FaExpand />
        </button>
      )}
    </div>
  );
}