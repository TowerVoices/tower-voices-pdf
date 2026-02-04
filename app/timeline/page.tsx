'use client'; 

import { useState, useEffect } from "react";
import { client } from "../sanity.client";
import { urlFor } from "../sanity.image";
import Link from "next/link";
import { FaHistory, FaProjectDiagram, FaBook, FaLayerGroup, FaTags, FaArrowRight } from "react-icons/fa";

export default function TimelinePage() {
  const [works, setWorks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      // التحديث: استعلام صارم يضمن جلب الأعمال المخصصة للخريطة فقط
      const query = `*[_type == "work" && chronologicalOrder > 0 && storyType != "none" && storyType != null && hideFromTimeline != true] | order(chronologicalOrder asc) {
        title,
        "slug": slug.current,
        "rawCover": cover,
        chronologicalOrder,
        timeDescription,
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

  const filteredWorks = activeTab === 'all' 
    ? works 
    : works.filter(w => w.storyType === activeTab);

  if (loading) return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center text-gray-500 font-bold tracking-widest animate-pulse">
      جاري تحميل خريطة البرج...
    </div>
  );

  return (
    <main dir="rtl" className="bg-[#050505] min-h-screen text-gray-200 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* زر العودة للمكتبة لتحسين التنقل */}
        <Link href="/works" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-blue-500 mb-8 transition-colors group">
           <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
           العودة للمكتبة الشاملة
        </Link>

        <header className="mb-12 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">
            النسخة التجريبية (Beta)
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">خريطة المسارات</h1>
          <p className="text-gray-500 font-bold">دليلك البصري لترتيب أحداث ري زيرو الزمني داخل البرج</p>
        </header>

        {/* نظام التبويبات التفاعلي */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 bg-white/5 p-2 rounded-3xl md:rounded-full w-fit mx-auto backdrop-blur-md border border-white/5 shadow-2xl">
          <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={<FaLayerGroup />} label="الكل" color="blue" />
          <TabButton active={activeTab === 'main'} onClick={() => setActiveTab('main')} icon={<FaBook />} label="القصة الأساسية" color="green" />
          <TabButton active={activeTab === 'ex'} onClick={() => setActiveTab('ex')} icon={<FaHistory />} label="روايات EX" color="purple" />
          <TabButton active={activeTab === 'if'} onClick={() => setActiveTab('if')} icon={<FaProjectDiagram />} label="مسارات IF" color="red" />
          <TabButton active={activeTab === 'side'} onClick={() => setActiveTab('side')} icon={<FaTags />} label="قصص جانبية" color="orange" />
        </div>

        <div className="relative border-r-2 border-white/5 mr-4 pr-8 space-y-12 transition-all duration-500">
          {filteredWorks.length > 0 ? filteredWorks.map((work) => (
            <div key={work.slug} className="relative group animate-in fade-in slide-in-from-right-4 duration-700">
              
              {/* النقطة الزمنية المتوهجة */}
              <div className={`absolute -right-[41px] top-2 w-5 h-5 rounded-full border-4 border-[#050505] transition-all
                ${work.storyType === 'ex' ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 
                  work.storyType === 'if' ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 
                  work.storyType === 'side' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' :
                  'bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.5)]'}`} 
              />
              
              <Link href={`/works/${work.slug}`} className="block">
                <div className={`bg-zinc-900/30 border p-5 rounded-[2.5rem] transition-all flex flex-col md:flex-row gap-6 hover:bg-zinc-900/50
                  ${work.storyType === 'ex' ? 'hover:border-purple-500/30' : 
                    work.storyType === 'if' ? 'hover:border-red-500/30' : 
                    work.storyType === 'side' ? 'hover:border-orange-500/30' : 'hover:border-green-500/30'}
                  border-white/5 shadow-xl`}>
                  
                  <div className="w-24 h-36 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                    <img 
                      src={work.rawCover ? urlFor(work.rawCover).url() : ""} 
                      alt={work.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">المرحلة {work.chronologicalOrder}</span>
                       
                       {/* عرض الوصف الزمني من Sanity */}
                       {work.timeDescription && (
                         <span className="text-[10px] text-gray-400 font-bold border-r border-white/10 pr-2 mr-1">
                           {work.timeDescription}
                         </span>
                       )}

                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mr-auto
                         ${work.storyType === 'ex' ? 'bg-purple-500/10 text-purple-400' : 
                           work.storyType === 'if' ? 'bg-red-500/10 text-red-400' : 
                           work.storyType === 'side' ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
                         {work.storyType === 'ex' ? 'رواية EX' : work.storyType === 'if' ? 'مسار IF' : work.storyType === 'side' ? 'قصة جانبية' : 'قصة أساسية'}
                       </span>
                    </div>
                    <h2 className="text-xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                      {work.title}
                    </h2>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 font-medium opacity-80">{work.synopsis}</p>
                  </div>
                </div>
              </Link>
            </div>
          )) : (
            <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
              <p className="text-gray-500 font-bold italic">لا توجد أعمال منشورة في هذا المسار حالياً..</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function TabButton({ active, onClick, icon, label, color }: any) {
  const colorClasses: any = {
    blue: "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]",
    green: "bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)]",
    purple: "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]",
    red: "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]",
    orange: "bg-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]",
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