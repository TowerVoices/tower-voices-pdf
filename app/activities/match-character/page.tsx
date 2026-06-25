"use client";

import { useState, useEffect } from "react";
import { client } from "@/app/sanity.client"; 

interface CharacterFromSanity {
  pairId: number;
  image: string;
  infoTexts: string[];
}

interface RewardFromSanity {
  name: string;
  image: string;
  rarity: string;
}

interface CardData {
  id: number;
  pairId: number;
  type: "character" | "info";
  image?: string;
  text?: string;
}

export default function MatchCharacterPage() {
  const [dbCharacters, setDbCharacters] = useState<CharacterFromSanity[]>([]);
  const [dbRewards, setDbRewards] = useState<RewardFromSanity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [shuffledCards, setShuffledCards] = useState<CardData[]>([]);
  const [openedCards, setOpenedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [reward, setReward] = useState<any>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const MAX_LEVEL = 3;

  const completionRate = currentLevel === 1 ? 87 : currentLevel === 2 ? 62 : 34;

  useEffect(() => {
    const fetchSanityData = async () => {
      try {
        const charQuery = `*[_type == "activityCharacter"]{
          pairId,
          "image": image.asset->url,
          infoTexts
        }`;
        
        const rewardQuery = `*[_type == "activityReward"]{
          name,
          "image": image.asset->url,
          rarity
        }`;

        const [charData, rewardData] = await Promise.all([
          client.fetch(charQuery),
          client.fetch(rewardQuery)
        ]);

        setDbCharacters(charData);
        setDbRewards(rewardData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data from Sanity:", error);
        setIsLoading(false);
      }
    };
    fetchSanityData();
  }, []);

  const initializeLevel = (level: number, characters: CharacterFromSanity[]) => {
    if (characters.length === 0) return;

    // توزيع البطاقات المتناسق لحل مشكلة أبعاد الجوال
    const targetCount = level === 1 ? 3 : level === 2 ? 6 : 8;
    const count = Math.min(targetCount, characters.length);
    
    const selected = [...characters]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    let idCounter = 1;
    const newCards: CardData[] = selected
      .flatMap((item) => {
        const randomInfoIndex = Math.floor(Math.random() * (item.infoTexts?.length || 1));
        const randomText = item.infoTexts && item.infoTexts.length > 0 
          ? item.infoTexts[randomInfoIndex] 
          : "معلومة غير متوفرة";

        return [
          { id: idCounter++, pairId: item.pairId, type: "character" as const, image: item.image },
          { id: idCounter++, pairId: item.pairId, type: "info" as const, text: randomText },
        ];
      })
      .sort(() => Math.random() - 0.5);

    setShuffledCards(newCards);
    setOpenedCards([]);
    setMatchedCards([]);
    setAttempts(0);
    setSeconds(0);
    setGameFinished(false);
    setReward(null);
  };

  useEffect(() => {
    if (dbCharacters.length > 0) {
      initializeLevel(currentLevel, dbCharacters);
    }
  }, [currentLevel, dbCharacters]);

  useEffect(() => {
    if (gameFinished || shuffledCards.length === 0 || isLoading) return;
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [gameFinished, shuffledCards, isLoading]);

  // 🔥 نظام المشاركة النصية الاحترافي والمضمون 100%
  const handleShareClick = async () => {
    if (!reward) return;
    setIsSharing(true);

    const shareText = `🏆 تحدي أصوات البرج 🏆\nطابقت الشخصيات بنجاح وحصلت على بطاقة (${reward.name})! 🎉\n\n✨ المستوى: ${currentLevel}\n⏱️ الزمن: ${seconds} ثانية\n🎯 المحاولات: ${attempts}\n📊 تفوقت على ${completionRate}% من اللاعبين!\n\nهل يمكنك تحطيم رقمي؟ جرب التحدي من هنا 👇\nhttps://towervoices.online/activities/match-character`;

    try {
      if (navigator.share) {
        // فتح نافذة المشاركة الأصلية في الجوال
        await navigator.share({
          text: shareText
        });
      } else {
        // نسخ النص مباشرة إلى الحافظة في أجهزة الكمبيوتر
        await navigator.clipboard.writeText(shareText);
        alert("✅ تم نسخ النتيجة بنجاح! يمكنك الآن لصقها ومشاركتها مع أصدقائك.");
      }
    } catch (error) {
      console.log("تم إلغاء المشاركة", error);
    } finally {
      setIsSharing(false);
    }
  };

  const getRandomReward = () => {
    if (dbRewards.length === 0) return null;
    
    const roll = Math.random() * 100;
    let targetRarity = 'common';
    
    if (roll <= 10) targetRarity = 'legendary'; 
    else if (roll <= 40) targetRarity = 'rare'; 
    else targetRarity = 'common'; 

    const filteredRewards = dbRewards.filter(r => r.rarity === targetRarity);
    const pool = filteredRewards.length > 0 ? filteredRewards : dbRewards;
    
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleCardClick = (cardId: number) => {
    if (openedCards.includes(cardId) || matchedCards.includes(cardId) || openedCards.length >= 2) return;

    const newOpened = [...openedCards, cardId];
    setOpenedCards(newOpened);

    if (newOpened.length === 2) {
      setAttempts((prev) => prev + 1);

      const firstCard = shuffledCards.find((c) => c.id === newOpened[0]);
      const secondCard = shuffledCards.find((c) => c.id === newOpened[1]);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        const newMatched = [...matchedCards, ...newOpened];
        setMatchedCards(newMatched);
        setOpenedCards([]); 

        if (newMatched.length === shuffledCards.length) {
          const wonReward = getRandomReward(); 
          setReward(wonReward);
          setGameFinished(true);
          setTimeout(() => setShowRewardModal(true), 500);
        }
      } else {
        setTimeout(() => setOpenedCards([]), 1000);
      }
    }
  };

  const handleNextLevel = () => {
    setShowRewardModal(false);
    if (currentLevel < MAX_LEVEL) {
      setCurrentLevel((prev) => prev + 1);
    } else {
      setCurrentLevel(1);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#312e81_0%,#000_60%)] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-bold animate-pulse">جاري تجهيز التحدي...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-8 bg-[radial-gradient(circle_at_top,#312e81_0%,#000_60%)] text-white relative z-0">
      
      <div className="w-full max-w-6xl mx-auto flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center md:text-right">
          طابق الشخصية مع المعلومة
        </h1>

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

      <div className="flex-1 flex items-center justify-center w-full">
        <div 
          className={`bg-zinc-800/80 border-4 border-zinc-900 rounded-3xl p-3 sm:p-4 md:p-6 w-full mx-auto shadow-2xl backdrop-blur-sm transition-all duration-500 ${
            shuffledCards.length === 12 ? 'max-w-4xl' : 
            shuffledCards.length >= 14 ? 'max-w-6xl' : 
            'max-w-2xl' 
          }`}
        >
          <div 
            className={`grid gap-2 sm:gap-3 md:gap-4 w-full mx-auto ${
              shuffledCards.length === 12 ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6' : 
              shuffledCards.length >= 14 ? 'grid-cols-4 sm:grid-cols-4 md:grid-cols-8' : 
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
                      <div className="text-center font-bold text-zinc-100 text-[10px] sm:text-xs md:text-sm leading-snug animate-in fade-in duration-300">
                        {card.text}
                      </div>
                    )
                  ) : (
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-500">؟</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* نافذة المكافأة التي تظهر للمستخدم عند الفوز */}
      {showRewardModal && reward && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-8 text-center w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              🎉 عمل رائع!
            </h2>
            <p className="mb-6 text-zinc-400">حصلت على بطاقة جديدة</p>

            <div className="relative mx-auto w-60 flex justify-center items-center mb-6 -mt-6">
              {reward.rarity === 'legendary' && <div className="absolute inset-0 bg-yellow-500 blur-[40px] opacity-40 rounded-full animate-pulse scale-110"></div>}
              {reward.rarity === 'rare' && <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-40 rounded-full animate-pulse scale-110"></div>}
              
              <img
                src={reward.image}
                alt={reward.name}
                className="w-full h-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <p className={`text-2xl font-bold ${
              reward.rarity === 'legendary' ? 'text-yellow-400' : 
              reward.rarity === 'rare' ? 'text-blue-400' : 'text-white'
            }`}>
              {reward.name}
            </p>
            <p className="text-xs mt-1 text-zinc-500 uppercase tracking-widest">{reward.rarity}</p>

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
                onClick={handleShareClick}
                disabled={isSharing}
              >
                {isSharing ? 'جاري المشاركة... ⏳' : '📤 مشاركة النتيجة'}
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