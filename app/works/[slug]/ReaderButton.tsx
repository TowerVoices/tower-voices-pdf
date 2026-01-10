"use client";
import Link from "next/link";
import { FaBookOpen } from "react-icons/fa";

// نقوم بتمرير الـ slug الخاص بالرواية للانتقال لصفحتها
interface ReaderButtonProps {
  slug: string;
}

export default function ReaderButton({ slug }: ReaderButtonProps) {
  return (
    <Link 
      href={`/reader/${slug}`}
      className="group relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 w-full sm:w-auto overflow-hidden"
    >
      {/* تأثير اللمعان (Shimmer) الذي صممته سابقاً */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
      
      <FaBookOpen className="text-xl" /> 
      <span>قراءة الرواية الآن</span>
    </Link>
  );
}