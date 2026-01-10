"use client";
import { useState } from "react";
import { Worker, Viewer, SpecialZoomLevel, ViewMode } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaRegFileAlt, FaThList, FaArrowsAltH, 
  FaArrowsAltV, FaCog, FaTimes, FaPlus, FaMinus
} from "react-icons/fa";

// تعريف Props لاستقبال دالة الإغلاق من الملف الأب
interface ModernReaderProps {
    pdfUrl: string;
    title: string;
    onClose: () => void; // دالة جديدة للإغلاق
}

export default function ModernReader({ pdfUrl, title, onClose }: ModernReaderProps) {
  const [showControls, setShowControls] = useState(false);
  // نبدأ بمستوى تقريب رقمي (1.0 = 100%) لسهولة التحكم بالزرين + و -
  const [scale, setScale] = useState<number | SpecialZoomLevel>(1.0);
  const [viewMode, setViewMode] = useState<ViewMode | undefined>(undefined);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // دوال التحكم في الزوم
  const handleZoomIn = () => setScale(prev => (typeof prev === 'number' ? Math.min(prev + 0.25, 3.0) : 1.25));
  const handleZoomOut = () => setScale(prev => (typeof prev === 'number' ? Math.max(prev - 0.25, 0.5) : 0.75));

  return (
    // الحاوية الرئيسية: تغطي الشاشة بالكامل وتستخدم Flexbox لتوزيع العناصر عمودياً
    <div dir="rtl" className="fixed inset-0 z-[9999] bg-[#121212] flex flex-col font-sans">
      
      {/* === 1. البار العلوي الجديد (Top Bar) === */}
      <header className="h-16 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-6 z-20 shadow-md">
          
          {/* زر الإعدادات (يمين) */}
          <button 
              onClick={() => setShowControls(true)}
              className="p-3 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-xl transition-all"
              title="إعدادات القراءة"
          >
              <FaCog size={20} />
          </button>

          {/* عنوان الرواية (وسط) */}
          <h1 className="text-white font-bold text-lg truncate max-w-md text-center mx-4">
              {title}
          </h1>

          {/* زر الإغلاق (يسار) */}
          <button 
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-red-600/80 text-gray-400 hover:text-white rounded-xl transition-all"
              title="إغلاق القارئ"
          >
              <FaTimes size={20} />
          </button>
      </header>

      {/* === 2. منطقة المحتوى الرئيسية (توسيط الـ PDF) === */}
      <main className="flex-1 relative overflow-hidden bg-[#1a1a1a] flex justify-center items-start pt-4 pb-0">
        {/* حاوية الـ PDF: تحدد العرض وتجعله في المنتصف */}
        <div className="h-full w-auto relative shadow-2xl overflow-auto custom-scrollbar">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
                fileUrl={pdfUrl}
                scale={scale} // استخدام خاصية scale بدلاً من defaultScale للتحكم اللحظي
                plugins={[defaultLayoutPluginInstance]}
                viewMode={viewMode}
                theme="dark" // تفعيل الوضع الداخلي المظلم للمكتبة
            />
            </Worker>
        </div>
      </main>

      {/* === 3. لوحة التحكم الجانبية (Sidebar) === */}
      <AnimatePresence>
        {showControls && (
          <motion.aside 
            initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
            className="fixed top-16 right-0 bottom-0 w-80 bg-[#0d0d12]/98 backdrop-blur-3xl border-l border-white/5 p-6 flex flex-col gap-8 shadow-[-25px_0_60px_rgba(0,0,0,0.9)] z-[30]"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <h3 className="text-blue-500 text-sm font-bold uppercase flex items-center gap-2 tracking-widest">
                  <FaCog className="animate-spin-slow" /> تفضيلات القراءة
               </h3>
               <button onClick={() => setShowControls(false)} className="text-gray-500 hover:text-white transition-colors p-2">
                  <FaTimes size={18} />
               </button>
            </div>

            {/* قسم الزوم الجديد */}
            <section className="space-y-4">
              <h4 className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-1">التحكم في التكبير (Zoom)</h4>
              
              {/* أزرار + و - الجديدة */}
              <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl mb-3">
                <button onClick={handleZoomOut} className="p-3 hover:bg-white/10 rounded-xl text-white transition-all"><FaMinus /></button>
                <span className="font-bold text-blue-400">
                    {typeof scale === 'number' ? `${Math.round(scale * 100)}%` : 'تلقائي'}
                </span>
                <button onClick={handleZoomIn} className="p-3 hover:bg-white/10 rounded-xl text-white transition-all"><FaPlus /></button>
              </div>

              {/* الأزرار السريعة السابقة */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setScale(SpecialZoomLevel.PageWidth)}
                  className={`flex items-center gap-4 p-3 rounded-xl text-[11px] border transition-all ${scale === SpecialZoomLevel.PageWidth ? "bg-zinc-800 border-white/10 text-white" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaArrowsAltH className="text-blue-500" /> ملائمة عرض الشاشة
                </button>
                <button 
                  onClick={() => setScale(1.0)} // إعادة للحجم الأصلي 100%
                  className={`flex items-center gap-4 p-3 rounded-xl text-[11px] border transition-all ${scale === 1.0 ? "bg-zinc-800 border-white/10 text-white" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaArrowsAltV className="text-blue-500" /> الحجم الأصلي (100%)
                </button>
              </div>
            </section>

             {/* قسم نمط العرض */}
            <section className="space-y-4">
              <h4 className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-1">نمط الصفحات</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setViewMode(ViewMode.SinglePage)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === ViewMode.SinglePage ? "bg-blue-600 border-blue-400 text-white shadow-lg" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaRegFileAlt size={18}/> صفحة واحدة
                </button>
                <button 
                  onClick={() => setViewMode(undefined)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 text-[10px] border transition-all ${viewMode === undefined ? "bg-blue-600 border-blue-400 text-white shadow-lg" : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"}`}
                >
                  <FaThList size={18}/> تمرير مستمر
                </button>
              </div>
            </section>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}