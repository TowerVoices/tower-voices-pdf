"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Worker,
  Viewer,
  SpecialZoomLevel,
  ViewMode,
} from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaRegFileAlt,
  FaThList,
  FaCog,
  FaTimes,
  FaPlus,
  FaMinus,
  FaSpinner,
} from "react-icons/fa";

export default function ModernReader({
  pdfUrl,
  title,
}: {
  pdfUrl: string;
  title: string;
}) {
  const router = useRouter();
  const [showControls, setShowControls] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;

  const handleClose = () => router.back();

  const finalPdfUrl = useMemo(() => {
    if (!pdfUrl) return "";
    if (pdfUrl.includes("drive.google.com")) {
      const driveId =
        pdfUrl.split("/d/")[1]?.split("/")[0] ||
        pdfUrl.split("id=")[1]?.split("&")[0];
      return driveId ? `/api/pdf-proxy?id=${driveId}` : pdfUrl;
    }
    return pdfUrl;
  }, [pdfUrl]);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col font-sans select-none overflow-hidden"
    >
      {/* 1. مُبيد الخطوط والظلال البيضاء (الأقوى على الإطلاق) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* قتل الخلفية والظلال في كل طبقات المكتبة */
            .rpv-core__viewer,
            .rpv-core__inner-pages,
            .rpv-core__page-container,
            .rpv-core__page-layer,
            .rpv-core__canvas-layer,
            .rpv-core__text-layer,
            .rpv-core__annotation-layer {
              background-color: transparent !important;
              box-shadow: none !important;
              border: none !important;
              outline: none !important;
            }

            /* جعل المنطقة المحيطة بالصفحات سوداء تماماً */
            .rpv-core__inner-pages {
              background-color: #050505 !important;
            }

            /* إزالة أي هوامش أو فواصل بيضاء/رمادية بين الصفحات */
            .rpv-core__page-container {
              margin: 0 auto !important;
              padding: 0 !important;
            }

            /* إخفاء شريط التمرير (السكروول) تماماً لمظهر سينمائي */
            .rpv-core__viewer::-webkit-scrollbar {
              width: 0px !important;
              height: 0px !important;
            }
            .rpv-core__viewer {
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }

            /* التأكد من عدم وجود إطار حول الـ Canvas */
            canvas {
              border: none !important;
              box-shadow: none !important;
            }
          `,
        }}
      />

      {/* البار العلوي */}
      <header className="h-14 bg-black/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-[10001]">
        <button
          onClick={() => setShowControls(!showControls)}
          className={`p-2.5 rounded-xl transition-all ${
            showControls
              ? "bg-blue-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <FaCog size={18} className={showControls ? "rotate-90" : ""} />
        </button>
        <h1 className="text-gray-300 font-bold text-xs truncate max-w-md">
          {title}
        </h1>
        <button
          onClick={handleClose}
          className="p-2.5 bg-white/5 hover:bg-red-600/20 text-gray-400 rounded-xl transition-all"
        >
          <FaTimes size={18} />
        </button>
      </header>

      {/* منطقة العرض الرئيسية */}
      <main className="flex-1 relative bg-[#050505] flex justify-center items-start overflow-y-auto">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050505] gap-4">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            <p className="text-[10px] text-gray-600 tracking-widest font-bold">
              جاري استحضار الصفحات...
            </p>
          </div>
        )}

        {/* الحاوية - أزلنا الـ shadow والـ border تماماً */}
        <div className="w-full max-w-4xl bg-transparent overflow-hidden relative border-none shadow-none">
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

      {/* القائمة الجانبية */}
      <AnimatePresence>
        {showControls && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="fixed top-14 right-0 bottom-0 w-72 bg-[#0d0d12]/95 backdrop-blur-3xl border-l border-white/5 p-8 flex flex-col gap-10 z-[10000] shadow-2xl"
          >
            <section className="space-y-6">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right">
                التحكم في التكبير
              </h4>
              <div className="flex items-center justify-between bg-white/5 p-1.5 rounded-2xl border border-white/5">
                <ZoomOut>
                  {(p) => (
                    <button
                      onClick={p.onClick}
                      className="p-4 hover:bg-white/10 rounded-xl text-gray-400 transition-all"
                    >
                      <FaMinus />
                    </button>
                  )}
                </ZoomOut>
                <CurrentScale>
                  {(p) => (
                    <span className="text-blue-500 font-black text-xs">
                      {Math.round(p.scale * 100)}%
                    </span>
                  )}
                </CurrentScale>
                <ZoomIn>
                  {(p) => (
                    <button
                      onClick={p.onClick}
                      className="p-4 hover:bg-white/10 rounded-xl text-gray-400 transition-all"
                    >
                      <FaPlus />
                    </button>
                  )}
                </ZoomIn>
              </div>
            </section>

            <section className="space-y-6 text-right">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                نمط العرض
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setViewMode(ViewMode.SinglePage)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-3 text-[10px] border transition-all ${
                    viewMode === ViewMode.SinglePage
                      ? "bg-blue-600 border-blue-400 text-white shadow-xl"
                      : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"
                  }`}
                >
                  <FaRegFileAlt size={20} /> صفحة
                </button>
                <button
                  onClick={() => setViewMode(undefined)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-3 text-[10px] border transition-all ${
                    viewMode === undefined
                      ? "bg-blue-600 border-blue-400 text-white shadow-xl"
                      : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"
                  }`}
                >
                  <FaThList size={20} /> مستمر
                </button>
              </div>
            </section>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}