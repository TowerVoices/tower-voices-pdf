"use client";

import { useState, useEffect } from "react";
// افترض أن هذه المسارات صحيحة في مشروعك
import { allCharacters } from "@/app/data/activities/allCharacters";
import { rewards } from "@/app/data/activities/rewards";
import html2canvas from "html2canvas";

// واجهات البيانات (Interfaces) لضمان كتابة كود TypeScript نظيف
interface CardData {
  id: number;
  pairId: number;
  type: "character" | "info";
  image?: string;
  text?: string;
}

export default function MatchCharacterPage() {
  const [shuffledCards, setShuffledCards] = useState<CardData[]>([]);
  const [openedCards, setOpenedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [reward, setReward] = useState<any>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const MAX_LEVEL = 3;

  // نسبة الإنجاز بناءً على المستوى
  const completionRate = currentLevel === 1 ? 87 : currentLevel === 2 ? 62 : 34;

  // دالة تهيئة المستوى (تقوم بخلط وتجهيز البطاقات للمستوى الحالي)
  const initializeLevel = (level: number) => {
    const count = level === 1 ? 3 : level === 2 ? 5 : 7;
    
    // اختيار شخصيات عشوائية بناءً على العدد المطلوب
    const selected = [...allCharacters]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    let idCounter = 1;
    const newCards: CardData[] = selected
      .flatMap((item) => [
        { id: idCounter++, pairId: item.pairId, type: "character" as const, image: item.image },
        { id: idCounter++, pairId: item.pairId, type: "info" as const, text: item.text },
      ])
      .sort(() => Math.random() - 0.5);

    setShuffledCards(newCards);
    setOpenedCards([]);
    setMatchedCards([]);
    setAttempts(0);
    setSeconds(0);
    setGameFinished(false);
    setReward(null);
  };

  // تشغيل تهيئة المستوى عند تغيير رقم المستوى
  useEffect(() => {
    initializeLevel(currentLevel);
  }, [currentLevel]);

  // عداد الوقت
  useEffect(() => {
    if (gameFinished || shuffledCards.length === 0) return;
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [gameFinished, shuffledCards]);

  // دالة التقاط الشاشة والمشاركة
  const saveResultImage = async () => {
    const element = document.getElementById("share-card");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#000000",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `tower-voices-level-${currentLevel}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  // معالجة النقر على البطاقة
  const handleCardClick = (cardId: number) => {
    // منع النقر إذا كانت البطاقة مفتوحة، متطابقة، أو إذا كان هناك بطاقتين مفتوحتين بالفعل
    if (
      openedCards.includes(cardId) ||
      matchedCards.includes(cardId) ||
      openedCards.length >= 2
    ) return;

    const newOpened = [...openedCards, cardId];
    setOpenedCards(newOpened);

    // إذا تم فتح بطاقتين
    if (newOpened.length === 2) {
      setAttempts((prev) => prev + 1);

      const firstCard = shuffledCards.find((c) => c.id === newOpened[0]);
      const secondCard = shuffledCards.find((c) => c.id === newOpened[1]);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // تطابق صحيح
        const newMatched = [...matchedCards, ...newOpened];
        setMatchedCards(newMatched);
        setOpenedCards([]); // تفريغ فوري للبطاقات المفتوحة لأنها أصبحت متطابقة

        // التحقق من إنهاء المستوى
        if (newMatched.length === shuffledCards.length) {
          const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
          setReward(randomReward);
          setGameFinished(true);
          setTimeout(() => setShowRewardModal(true), 500); // تأخير بسيط لظهور النافذة
        }
      } else {
        // تطابق خاطئ - إغلاق البطاقات بعد ثانية
        setTimeout(() => setOpenedCards([]), 1000);
      }
    }
  };

  // دالة الانتقال للمرحلة التالية
  const handleNextLevel = () => {
    setShowRewardModal(false);
    if (currentLevel < MAX_LEVEL) {
      setCurrentLevel((prev) => prev + 1);
    } else {
      // إذا أنهى جميع المستويات، يعود للمستوى الأول
      setCurrentLevel(1);
    }
  };

  return (
    // استخدام flex-col لتوزيع العناصر عمودياً وجعل الشاشة بالكامل حاوية للعبة
    <main className="min-h-screen flex flex-col p-4 md:p-8 bg-[radial-gradient(circle_at_top,#312e81_0%,#000_60%)] text-white">
      
      {/* القسم العلوي (العنوان والإحصائيات) */}
      <div className="w-full max-w-6xl mx-auto flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center md:text-right">
          طابق الشخصية مع المعلومة
        </h1>

        {/* شريط الإحصائيات */}
        <div className="flex gap-3 md:gap-4 mb-6 flex-wrap justify-center md:justify-start text-sm md:text-base">
          <div className="border border-indigo-500/30 bg-indigo-900/20 rounded-lg px-4 py-2 font-semibold">
            المستوى {currentLevel}
          </div>
          <div className="border border-zinc-700 bg-zinc-800/50 rounded-lg px-4 py-2">
            ⏱️ {seconds} ثانية
          </div>
          <div className="border border-zinc-700 bg-zinc-800/50 rounded-lg px-4 py-2">
            🎯 {attempts} محاولة
          </div>
        </div>
      </div>

      {/* 🎮 حاوية اللعب الديناميكية التي تتوسط الشاشة */}
      <div className="flex-1 flex items-center justify-center w-full">
        
        {/* المربع الخارجي (لوحة اللعب) - قمنا بجعل العرض (max-w) يتغير حسب المستوى */}
        <div 
          className={`bg-zinc-800/80 border-4 border-zinc-900 rounded-3xl p-4 md:p-6 w-full mx-auto shadow-2xl backdrop-blur-sm transition-all duration-500 ${
            shuffledCards.length === 10 ? 'max-w-5xl' : 
            shuffledCards.length === 14 ? 'max-w-7xl' : 
            'max-w-3xl' // الحجم الأصغر للمستوى الأول
          }`}
        >
          
          {/* شبكة البطاقات الديناميكية:
            - المستوى 1 (6 بطاقات): 3 أعمدة
            - المستوى 2 (10 بطاقات): 5 أعمدة
            - المستوى 3 (14 بطاقة): 7 أعمدة
          */}
          <div 
            className={`grid gap-2 md:gap-4 w-full mx-auto ${
              shuffledCards.length === 10 ? 'grid-cols-3 sm:grid-cols-5' : 
              shuffledCards.length === 14 ? 'grid-cols-4 sm:grid-cols-7' : 
              'grid-cols-2 sm:grid-cols-3' 
            }`}
          >
            {shuffledCards.map((card) => {
              const isOpened = openedCards.includes(card.id);
              const isMatched = matchedCards.includes(card.id);
              const isFlipped = isOpened || isMatched;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  // تقليل الـ Padding الداخلي ليتناسب مع الحجم الجديد
                  className={`
                    aspect-[3/4] rounded-xl md:rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden flex items-center justify-center p-2 md:p-3
                    ${isMatched ? 'border-green-500/30 bg-green-950/20 opacity-30 grayscale-[50%] pointer-events-none scale-95' : 'hover:scale-[1.02]'}
                    ${isOpened && !isMatched ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.4)] bg-zinc-700' : ''}
                    ${!isFlipped ? 'border-zinc-600 bg-gradient-to-b from-zinc-700 to-zinc-900 hover:border-zinc-400' : 'bg-zinc-800'}
                  `}
                >
                  {isFlipped ? (
                    card.type === "character" ? (
                      <img
                        src={card.image}
                        alt="character"
                        className="w-full h-full object-contain pointer-events-none animate-in fade-in zoom-in duration-300"
                      />
                    ) : (
                      // تصغير حجم الخط بشكل ديناميكي لكي لا يخرج عن حدود البطاقة
                      <div className="text-center font-bold text-zinc-100 text-[11px] sm:text-xs md:text-sm leading-snug animate-in fade-in duration-300">
                        {card.text}
                      </div>
                    )
                  ) : (
                    // تصغير حجم علامة الاستفهام
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-500">؟</div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* القالب المخفي الخاص بالتقاط الصورة (Share Card) */}
      <div
        id="share-card"
        className="fixed -left-[9999px] top-0 w-[900px] bg-gradient-to-b from-zinc-900 to-black text-white p-12 rounded-3xl border border-zinc-800"
      >
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 text-indigo-400">أصوات البرج</h1>
          <p className="text-zinc-400 mb-8 text-2xl">تحدي مطابقة الشخصيات</p>
          {reward && (
            <>
              <img src={reward.image} alt="" className="w-72 mx-auto rounded-2xl shadow-2xl mb-6" />
              <h2 className="text-4xl font-bold mt-4">{reward.name}</h2>
              <div className="mt-8 space-y-4 text-2xl bg-zinc-900/50 p-8 rounded-2xl inline-block text-right">
                <p>🏆 المستوى: <span className="text-indigo-400">{currentLevel}</span></p>
                <p>⏱️ الزمن: <span className="text-indigo-400">{seconds} ثانية</span></p>
                <p>🎯 المحاولات: <span className="text-indigo-400">{attempts}</span></p>
                <p>📊 تفوقت على <span className="text-green-400">{completionRate}%</span> من اللاعبين</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* نافذة الجائزة ونهاية المستوى (Modal) */}
      {showRewardModal && reward && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-8 text-center w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              🎉 عمل رائع!
            </h2>
            <p className="mb-6 text-zinc-400">حصلت على بطاقة جديدة</p>

            <img
              src={reward.image}
              alt={reward.name}
              className="w-48 mx-auto rounded-xl shadow-lg border border-zinc-700/50"
            />
            <p className="mt-4 text-2xl font-bold">{reward.name}</p>

            <div className="mt-6 bg-black/30 p-4 rounded-xl space-y-3 text-sm text-zinc-300 text-right">
              <p className="flex justify-between"><span>الزمن:</span> <span>{seconds} ثانية ⏱️</span></p>
              <p className="flex justify-between"><span>المحاولات:</span> <span>{attempts} 🎯</span></p>
              <p className="flex justify-between text-indigo-300 font-medium">
                <span>اجتاز هذه المرحلة:</span> <span>{completionRate}% 📊</span>
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                onClick={saveResultImage}
              >
                📸 مشاركة النتيجة
              </button>
              <button
                className="w-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors py-3.5 rounded-xl font-semibold"
                onClick={handleNextLevel}
              >
                {currentLevel < MAX_LEVEL ? "المستوى التالي ←" : "إعادة اللعب 🔄"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}