"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const uiTexts = {
  ar: {
    pageTitle: "مَن أنت؟",
    subtitle: "استعد ذكرياتك... واحذر من وحش اللارب ومن نداء الساحرة!",
    soon: "قريباً ⏳",
    preparing: "يتم التجهيز...",
    startChallenge: "ابدأ التحدي",
    arrow: "←",
    langName: "English"
  },
  en: {
    pageTitle: "Who Are You?",
    subtitle: "Reclaim your memories... and beware the larpMonster and the Call of the Witch!",
    soon: "Soon ⏳",
    preparing: "Preparing...",
    startChallenge: "Start Challenge",
    arrow: "→",
    langName: "العربية"
  }
};

export default function ActivitiesPage() {
  // نجعل العربية هي اللغة الافتراضية للـ Server Side Rendering لكي تتأرشف في جوجل
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>('ar');
  const [isMounted, setIsMounted] = useState(false); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      const savedLang = localStorage.getItem('siteLang');
      
      let targetLang: 'ar' | 'en' = 'ar'; 

      if (urlLang === 'en' || urlLang === 'ar') {
        targetLang = urlLang;
        localStorage.setItem('siteLang', urlLang);
      } 
      else if (savedLang === 'en' || savedLang === 'ar') {
        targetLang = savedLang;
      } 
      else {
        const browserLang = navigator.language || (navigator.languages && navigator.languages[0]);
        if (browserLang && !browserLang.toLowerCase().startsWith('ar')) {
          targetLang = 'en';
        }
      }
      
      setCurrentLanguage(targetLang);
      setIsMounted(true); 
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = currentLanguage === 'ar' ? 'en' : 'ar';
    setCurrentLanguage(nextLang);
    localStorage.setItem('siteLang', nextLang); 
  };

  const t = uiTexts[currentLanguage];

  // تم إزالة الشاشة السوداء الفارغة لكي تتمكن محركات البحث من قراءة النصوص والروابط

  const activities = [
    {
      id: "quiz",
      title: currentLanguage === 'ar' ? "اختبار المعرفة" : "Knowledge Quiz",
      description: currentLanguage === 'ar' ? "أجب عن الأسئلة واكتشف مدى معرفتك بالقصة" : "Answer questions and discover your lore knowledge",
      icon: "📜",
      link: "/activities/quiz", 
      color: "from-orange-600 to-red-600",
      btnColor: "text-orange-400 group-hover:text-orange-300",
      isComingSoon: false 
    },
    {
      id: "guess-character",
      title: currentLanguage === 'ar' ? "خمن الشخصية" : "Guess the Character",
      description: currentLanguage === 'ar' ? "هل يمكنك معرفة الشخصية من خلال التلميحات؟" : "Can you figure out the character from the hints?",
      icon: "🤔",
      link: "/activities/guess-character",
      color: "from-emerald-600 to-teal-600",
      btnColor: "text-emerald-400 group-hover:text-emerald-300",
      isComingSoon: false 
    },
    {
      id: "match-character",
      title: currentLanguage === 'ar' ? "طابق الشخصية" : "Match Character",
      description: currentLanguage === 'ar' ? "اختبر ذاكرتك في مطابقة الشخصيات مع معلوماتها" : "Test your memory by matching characters with their info",
      icon: "🎴",
      link: "/activities/match-character",
      color: "from-indigo-600 to-purple-600",
      btnColor: "text-indigo-400 group-hover:text-indigo-300",
      isComingSoon: false
    }
  ];

  return (
    <main 
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen p-8 bg-[radial-gradient(circle_at_top,#18181b_0%,#000_100%)] text-white flex flex-col items-center justify-center relative transition-opacity duration-300 ${isMounted ? 'opacity-100' : 'opacity-95'}`}
    >
      
      {/* إخفاء زر تبديل اللغة للحظات حتى لا يحدث وميض مزعج عند التحميل */}
      {isMounted && (
        <div className={`absolute top-6 ${currentLanguage === 'ar' ? 'left-6 md:left-12' : 'right-6 md:right-12'}`}>
          <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 border border-zinc-700 bg-zinc-800/80 rounded-full px-4 py-2 hover:border-zinc-500 transition-colors text-sm font-semibold z-10"
          >
              <span className="w-4 h-4 bg-transparent border border-white rounded-full flex items-center justify-center text-xs">🌐</span>
              {t.langName}
          </button>
        </div>
      )}

      <div className="text-center mb-12 mt-12 md:mt-0 flex flex-col items-center">
        <h1 
          className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 tracking-wider font-serif drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        >
          {t.pageTitle}
        </h1>
        
        <p className="text-red-500/80 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {activities.map((activity) => {
          const CardContent = (
            <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 h-full flex flex-col relative overflow-hidden
              ${activity.isComingSoon 
                ? 'opacity-60 cursor-not-allowed grayscale-[40%]' 
                : 'hover:border-zinc-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group' 
              }`}
            >
              {activity.isComingSoon && (
                <div className={`absolute top-4 ${currentLanguage === 'ar' ? 'left-4' : 'right-4'} bg-zinc-800 text-xs font-bold px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300`}>
                  {t.soon}
                </div>
              )}

              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4 bg-gradient-to-br ${activity.color}`}>
                {activity.icon}
              </div>
              
              {/* تم استخدام h2 هنا لتعزيز أرشفة العناوين الفرعية */}
              <h2 className="text-2xl font-bold mb-2">{activity.title}</h2>
              <p className="text-zinc-400 flex-1">{activity.description}</p>
              
              <div className={`mt-6 flex items-center text-sm font-semibold 
                ${activity.isComingSoon ? 'text-zinc-500' : activity.btnColor}`}
              >
                {activity.isComingSoon ? t.preparing : (
                  <>{t.startChallenge} <span className="mx-2">{t.arrow}</span></>
                )}
              </div>
            </div>
          );

          return activity.isComingSoon ? (
            <div key={activity.id}>{CardContent}</div>
          ) : (
            <Link href={`${activity.link}?lang=${currentLanguage}`} key={activity.id} className="block h-full">
              {CardContent}
            </Link>
          );
        })}
      </div>
    </main>
  );
}