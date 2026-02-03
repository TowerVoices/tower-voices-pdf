'use client'; // هذا السطر ضروري لجعل التبويبات تعمل

import { useState, useEffect } from "react";
import { client } from "../sanity.client";
import { urlFor } from "../sanity.image";
import Link from "next/link";
import { FaHistory, FaProjectDiagram, FaBook, FaLayerGroup } from "react-icons/fa";

export default function TimelinePage() {
  const [works, setWorks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // جلب البيانات عند فتح الصفحة
  useEffect(() => {
    const fetchTimeline = async () => {
      const query = `*[_type == "work" && chronologicalOrder > 0] | order(chronologicalOrder asc) {
        title,
        "slug": slug.current,
        "rawCover": cover,
        chronologicalOrder,
        synopsis,
        storyType,
        status
      }`;
      const data = await client.fetch(query);
      setWorks(data);
      setLoading(false);
    };
    fetchTimeline();
  }, []);

  // تصفية الأعمال بناءً على التبويب المختار
  const filteredWorks = activeTab === 'all' 
    ? works 
    : works.filter(w => w.storyType === activeTab);

  if (loading) return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center text-gray-500 font-bold">
      جاري تحميل خريطة البرج...
    </div>
  );

  return (
    <main dir="rtl" className="bg-[#050505] min-h-screen text-gray-200 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">خريطة المسارات</h1>
          <p className="text-gray-500 font-bold">اختر المسار الذي تريد تتبع أحداثه زمنياً</p>
        </header>

        {/* نظام التبويبات التفاعلي */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 bg-white/5 p-2 rounded-full w-fit mx-auto backdrop-blur-md border border-white/5">
          <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={<FaLayerGroup />} label="الكل" color="blue" />
          <TabButton active={activeTab === 'main'} onClick={() => setActiveTab('main')} icon={<FaBook />} label="القصة الأساسية" color="green" />
          <TabButton active={activeTab === 'ex'} onClick={() => setActiveTab('ex')} icon={<FaHistory />} label="روايات EX" color="purple" />
          <TabButton active={activeTab === 'if'} onClick={() => setActiveTab('if')} icon={<FaProjectDiagram />} label="مسارات IF" color="red" />
        </div>

        <div className="relative border-r-2 border-white/5 mr-4 pr-8 space-y-12 transition-all duration-500">
          {filteredWorks.length > 0 ? filteredWorks.map((work) => (
            <div key={work.slug} className="relative group animate-in fade-in slide-in-from-right-4 duration-500">
              {/* النقطة الملونة */}
              <div className={`absolute -right-[41px] top-2 w-5 h-5 rounded-full border-4 border-[#050505] transition-all
                ${work.storyType === 'ex' ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 
                  work.storyType === 'if' ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 
                  'bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.5)]'}`} 
              />
              
              <Link href={`/works/${work.slug}`} className="block">
                <div className={`bg-zinc-900/30 border p-5 rounded-[2rem] transition-all flex flex-col md:flex-row gap-6 hover:bg-zinc-900/50
                  ${work.storyType === 'ex' ? 'hover:border-purple-500/30' : 
                    work.storyType === 'if' ? 'hover:border-red-500/30' : 'hover:border-green-500/30'}
                  border-white/5`}>
                  
                  <div className="w-24 h-36 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                    <img src={work.rawCover ? urlFor(work.rawCover).url() : ""} alt={work.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">المرحلة {work.chronologicalOrder}</span>
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                         ${work.storyType === 'ex' ? 'bg-purple-500/10 text-purple-400' : 
                           work.storyType === 'if' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                         {work.storyType === 'ex' ? 'رواية EX' : work.storyType === 'if' ? 'مسار IF' : 'قصة أساسية'}
                       </span>
                    </div>
                    <h2 className="text-xl font-black text-white mb-2">{work.title}</h2>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{work.synopsis}</p>
                  </div>
                </div>
              </Link>
            </div>
          )) : (
            <div className="text-center py-20 text-gray-600 italic">لا توجد أعمال مترجمة في هذا المسار حالياً..</div>
          )}
        </div>
      </div>
    </main>
  );
}

// مكون الزر للتبويبات
function TabButton({ active, onClick, icon, label, color }: any) {
  const colorClasses: any = {
    blue: "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]",
    green: "bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)]",
    purple: "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]",
    red: "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]",
  };

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all duration-300
        ${active ? colorClasses[color] : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
    >
      {icon} {label}
    </button>
  );
}