"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { urlFor } from "../sanity.image";
import { FaSearch, FaFilter } from "react-icons/fa";

export default function WorksClient({ initialWorks }: { initialWorks: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("الكل");

  // استخراج كافة الوسوم (Tags) الفريدة من الأعمال
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tags.add("الكل");
    initialWorks.forEach(work => {
      work.tags?.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags);
  }, [initialWorks]);

  // منطق الفلترة والبحث
  const filteredWorks = useMemo(() => {
    return initialWorks.filter(work => {
      const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag === "الكل" || work.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [searchTerm, selectedTag, initialWorks]);

  return (
    <div className="space-y-12">
      {/* قسم البحث والفلترة */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
        
        {/* صندوق البحث */}
        <div className="relative w-full md:w-96 group">
          <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="ابحث عن رواية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
          />
        </div>

        {/* أزرار التصنيفات */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedTag === tag 
                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                : "bg-zinc-800/50 border-white/5 text-gray-400 hover:border-white/10"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* شبكة الأعمال المفلترة */}
      {filteredWorks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredWorks.map((work: any) => (
            <Link
              key={work.slug}
              href={`/works/${work.slug}`}
              className="group bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden transition-all hover:border-blue-500/40 hover:-translate-y-1"
            >
              <div className="aspect-[2/3] relative overflow-hidden">
                <img 
                  src={urlFor(work.cover).width(500).url()} 
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-[10px] px-3 py-1 rounded-full border border-white/10 text-white">
                  {work.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {work.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5">
          <p className="text-gray-500 italic">لا توجد نتائج تطابق بحثك..</p>
        </div>
      )}
    </div>
  );
}