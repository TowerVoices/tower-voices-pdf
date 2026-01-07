"use client";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ReportButton({ workTitle }: { workTitle: string }) {
  const handleReport = () => {
    // يمكنك تغيير الإيميل هنا لإيميلك الخاص
    const email = "support@tower-voices.com"; 
    const subject = encodeURIComponent(`بلاغ عن مشكلة في رواية: ${workTitle}`);
    const body = encodeURIComponent(`مرحباً فريق أصوات البرج،\n\nأود الإبلاغ عن مشكلة في عمل "${workTitle}".\n\nنوع المشكلة (رابط معطل / خطأ في الصور / أخرى):\n`);
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <button 
      onClick={handleReport}
      className="flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-red-900/40 text-white p-4 rounded-2xl border border-white/5 transition-all w-full sm:w-auto active:scale-95 group"
    >
      <FaExclamationTriangle className="text-red-500 group-hover:animate-pulse" /> 
      <span>إبلاغ</span>
    </button>
  );
}