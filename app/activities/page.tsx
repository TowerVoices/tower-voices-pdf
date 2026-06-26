"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const uiTexts = {
  ar: {
    pageTitle: "مركز الفعاليات",
    subtitle: "اختر التحدي الذي يناسبك واجمع المكافآت",
    soon: "قريباً ⏳",
    preparing: "يتم التجهيز...",
    startChallenge: "ابدأ التحدي",
    arrow: "←",
    langName: "English"
  },
  en: {
    pageTitle: "Activities Center",
    subtitle: "Choose your challenge and collect rewards",
    soon: "Soon ⏳",
    preparing: "Preparing...",
    startChallenge: "Start Challenge",
    arrow: "→",
    langName: "العربية"
  }
};

export default function ActivitiesPage() {
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>('ar');

  // 🔥 قراءة اللغة من الرابط أو من لغة متصفح المستخدم
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      
      // 1. الأولوية للغة الموجودة في الرابط (إذا كانت موجودة)
      if (urlLang === 'en' || urlLang === 'ar') {
        setCurrentLanguage(urlLang);
      } else {
        // 2. إذا لم يكن هناك لغة في الرابط، نكتشف لغة الجهاز التلقائية
        const browserLang = navigator.language || navigator.languages[0];
        // إذا كانت لغة الجهاز لا تبدأ بـ 'ar' (مثل ar-SA, ar-EG)، اجعل الموقع إنجليزي
        if (browserLang && !browserLang.toLowerCase().startsWith('ar')) {
          setCurrentLanguage('en');
        }
      }
    }
  }, []);

  const t = uiTexts[currentLanguage];

  const activities = [
    {
      id: "match-character",
      title: currentLanguage === 'ar' ? "طابق الشخصية" : "Match Character",
      description: currentLanguage === 'ar' ? "اختبر ذاكرتك في مطابقة الشخصيات مع معلوماتها" : "Test your memory by matching characters with their info",
      icon: "🎴",
      link: "/activities/match-character",
      color: "from-indigo-600 to-purple-600",
      isComingSoon: false
    },
    {
      id: "guess-character",
      title: currentLanguage === 'ar' ? "خمن الشخصية" : "Guess the Character",
      description: currentLanguage === 'ar' ? "هل يمكنك معرفة الشخصية من خلال التلميحات؟" : "Can you figure out the character from the hints?",
      icon: "🤔",
      link: "#",
      color: "from-emerald-600 to-teal-600",
      isComingSoon: true
    },
    {
      id: "quiz",
      title: currentLanguage === 'ar' ? "اختبار المعرفة" : "Knowledge Quiz",
      description: currentLanguage === 'ar' ? "أجب عن الأسئلة واكتشف مدى معرفتك بالقصة" : "Answer questions and discover your lore knowledge",
      icon: "📜",
      link: "#",
      color: "from-orange-600 to-red-600",
      isComingSoon: true
    }
  ];

  return (
    <main 
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen p-8 bg-[radial-gradient(circle_at_top,#18181b_0%,#000_100%)] text-white flex flex-col items-center justify-center relative"
    >
      
      <div className={`absolute top-6 ${currentLanguage === 'ar' ? 'left-6 md:left-12' : 'right-6 md:right-12'}`}>
        <button 
            onClick={() => setCurrentLanguage(currentLanguage === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2 border border-zinc-700 bg-zinc-800/80 rounded-full px-4 py-2 hover:border-zinc-500 transition-colors text-sm font-semibold z-10"
        >
            <span className="w-4 h-4 bg-transparent border border-white rounded-full flex items-center justify-center text-xs">🌐</span>
            {t.langName}
        </button>
      </div>

      <div className="text-center mb-12 mt-12 md:mt-0">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400">
          {t.pageTitle}
        </h1>
        <p className="text-zinc-400 text-lg">{t.subtitle}</p>
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
              
              <h2 className="text-2xl font-bold mb-2">{activity.title}</h2>
              <p className="text-zinc-400 flex-1">{activity.description}</p>
              
              <div className={`mt-6 flex items-center text-sm font-semibold 
                ${activity.isComingSoon ? 'text-zinc-500' : 'text-indigo-400 group-hover:text-indigo-300'}`}
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
            // 🔥 هنا يتم إرسال اللغة في الرابط للعبة
            <Link href={`${activity.link}?lang=${currentLanguage}`} key={activity.id} className="block h-full">
              {CardContent}
            </Link>
          );
        })}
      </div>
    </main>
  );
}