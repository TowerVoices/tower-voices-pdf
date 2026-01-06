"use client";

import { useState } from "react";
import { FaEyeSlash } from "react-icons/fa";

interface Props {
  text: string;
  isSpoiler: boolean;
}

export default function SpoilerSynopsis({ text, isSpoiler }: Props) {
  const [show, setShow] = useState(false);

  if (!isSpoiler) {
    return <p className="text-gray-300 leading-[2.2] text-lg text-right">{text}</p>;
  }

  return (
    // أضفنا min-h-[200px] لضمان وجود مساحة كافية كما في الصورة
    <div className="relative min-h-[200px] flex items-center justify-center overflow-hidden rounded-2xl group border border-white/5 bg-black/40 shadow-inner">
      
      {/* طبقة الغطاء الضبابي */}
      {!show && (
        <div 
          onClick={() => setShow(true)}
          className="absolute inset-0 z-20 backdrop-blur-3xl bg-black/60 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-black/80"
        >
          {/* تأثير توهج خلف الأيقونة */}
          <div className="relative mb-4">
             <div className="absolute inset-0 bg-red-600/30 rounded-full blur-2xl animate-pulse" />
             <div className="relative bg-zinc-900 border border-red-500/50 p-6 rounded-full shadow-2xl transition-transform group-hover:scale-110">
                <FaEyeSlash className="text-red-500 text-3xl" />
             </div>
          </div>

          <div className="text-center px-6">
            <h4 className="text-white font-black text-xl mb-1">محتوى حرق</h4>
            <p className="text-gray-400 text-sm mb-6">هذا الملخص يحتوي على تفاصيل قد تحرق عليك القصة</p>
            
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-8 rounded-full shadow-lg shadow-blue-900/20 transition-all active:scale-95">
              إظهار المحتوى
            </button>
          </div>
        </div>
      )}

      {/* النص الأصلي - يظهر بوضوح عند الضغط */}
      <div className={`w-full p-6 transition-all duration-1000 ease-out ${!show ? 'blur-3xl opacity-5 scale-95 select-none' : 'blur-0 opacity-100 scale-100'}`}>
        <p className="text-gray-300 leading-[2.2] text-lg text-right whitespace-pre-line">
          {text}
        </p>
      </div>
    </div>
  );
}