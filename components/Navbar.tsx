"use client";

import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* جهة اليمين: اسم الموقع */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xl font-black tracking-tighter text-white group-hover:text-blue-500 transition-colors">
            أصوات البرج
          </span>
        </Link>

        {/* جهة اليسار: أيقونة حسابك في X */}
        <div className="flex items-center gap-4">
          <a 
            href="https://x.com/TowerVoices" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all text-white group"
            title="تابعنا على X"
          >
            <FaXTwitter className="text-lg group-hover:scale-110 transition-transform" />
          </a>
        </div>

      </div>
    </nav>
  );
}