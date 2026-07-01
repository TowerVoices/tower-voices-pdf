"use client";

import { useState, useEffect, useRef } from "react";
import { client } from "@/app/sanity.client"; 

interface CharacterFromSanity {
  pairId: number;
  image: string;
  name: string;      
  nameEn: string;    
  infoTexts: string[];   
  infoTextsEn: string[]; 
}

interface RewardFromSanity {
  name: string;      
  nameEn: string;    
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

const uiTexts = {
  ar: {
    gameTitle: "طابق الشخصية مع المعلومة",
    startChallenge: "ابدأ التحدي الآن 🚀",
    subTitle: "اختبر ذاكرتك ومعرفتك بشخصيات \"ري زيرو\". طابق كل شخصية مع المعلومة الصحيحة.",
    level: "المستوى",
    errors: "الأخطاء",
    seconds: "ثانية",
    preparing: "جاري تجهيز التحدي...",
    winTitle: "🎉 عمل رائع!",
    gotCard: "حصلت على بطاقة جديدة",
    perfect: "يمنحك فرصة عالية جداً لبطاقة أسطورية!",
    good: "يمنحك فرصة لبطاقة نادرة.",
    average: "أكثر من ذلك يمنحك بطاقات عادية، فركز جيداً!",
    rewardRarity: "الندرة",
    share: "📤 مشاركة النتيجة",
    nextLevel: "المستوى التالي ←",
    replay: "إعادة اللعب 🔄",
    langName: "English",
    getCardsTitle: "كيف تحصل على البطاقات؟ 🃏",
    perfectTitle: "لعب مثالي (0 - 5 أخطاء)",
    goodTitle: "لعب جيد (6 - 10 أخطاء)",
    gameOverTitle: "💀 لقد خسرت!",
    gameOverDesc: "لقد تجاوزت الحد الأقصى من الأخطاء (15 خطأ)... استيقظ وحش اللارب ليقضي عليك!",
    restartGame: "العب من جديد"
  },
  en: {
    gameTitle: "Match Character to Info",
    startChallenge: "Start Challenge Now 🚀",
    subTitle: "Test your memory. Match each Re:Zero character with their correct information.",
    level: "Level",
    errors: "Errors",
    seconds: "sec",
    preparing: "Preparing Challenge...",
    winTitle: "🎉 Amazing Job!",
    gotCard: "You obtained a new card",
    perfect: "gives a very high chance of a Legendary card!",
    good: "gives a chance of a Rare card.",
    average: "More than that grants Common cards, so focus well!",
    rewardRarity: "Rarity",
    share: "📤 Share Result",
    nextLevel: "Next Level ←",
    replay: "Replay 🔄",
    langName: "العربية",
    getCardsTitle: "Get Cards! 🃏",
    perfectTitle: "Perfect (0 - 5 Errors)",
    goodTitle: "Good (6 - 10 Errors)",
    gameOverTitle: "💀 Game Over!",
    gameOverDesc: "You exceeded 15 mistakes... The Larp Monster has awakened to consume you!",
    restartGame: "Play Again"
  }
};

const MAX_LEVEL = 3;
const MAX_MISTAKES = 15;

// 🔥 دالة تشغيل الصوت المحسنة
const playSound = (audioPath: string) => {
  if (typeof window !== "undefined") {
    const audio = new Audio(audioPath);
    if (audioPath.includes("larp-monster")) audio.volume = 0.8;
    else audio.volume = 1.0;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Playback started successfully
      }).catch(error => {
        console.log("Audio play blocked by browser:", error);
      });
    }
  }
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MatchCharacterPage() {
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
      } else if (savedLang === 'en' || savedLang === 'ar') {
        targetLang = savedLang;
      } else {
        const browserLang = navigator.language || (navigator.languages && navigator.languages[0]);
        if (browserLang && !browserLang.toLowerCase().startsWith('ar')) {
          targetLang = 'en';
        }
      }
      
      setCurrentLanguage(targetLang);
      setIsMounted(true); 
    }
  }, []);

  const t = uiTexts[currentLanguage]; 

  const [dbCharacters, setDbCharacters] = useState<CharacterFromSanity[]>([]);
  const [dbRewards, setDbRewards] = useState<RewardFromSanity[]>([]);
  const [larpMonsterImage, setLarpMonsterImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [shuffledCards, setShuffledCards] = useState<CardData[]>([]);
  const [openedCards, setOpenedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [reward, setReward] = useState<any>(null);
  
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);

  const [errors, setErrors] = useState(0); 
  const [seconds, setSeconds] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  
  const [lastWonReward, setLastWonReward] = useState<string | null>(null);

  const usedInfoTextsRef = useRef<Record<number, number[]>>({});

  useEffect(() => {
    const fetchSanityData = async () => {
      try {
        const charQuery = `*[_type == "activityCharacter"]{
          pairId,
          "image": image.asset->url,
          name, nameEn,      
          infoTexts, infoTextsEn 
        }`;
        
        const rewardQuery = `*[_type == "activityReward"]{
          name, nameEn,      
          "image": image.asset->url,
          rarity
        }`;

        const settingsQuery = `*[_type == "gameSettings"][0]{
          "larpMonsterImage": larpMonsterImage.asset->url
        }`;

        const [charData, rewardData, settingsData] = await Promise.all([
          client.fetch(charQuery),
          client.fetch(rewardQuery),
          client.fetch(settingsQuery)
        ]);

        setDbCharacters(charData);
        setDbRewards(rewardData);
        if (settingsData?.larpMonsterImage) {
          setLarpMonsterImage(settingsData.larpMonsterImage);
        }
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

    if (level === 1) usedInfoTextsRef.current = {};

    const targetCount = level === 1 ? 3 : level === 2 ? 6 : 8;
    const count = Math.min(targetCount, characters.length);
    
    const selected = shuffleArray(characters).slice(0, count);

    let idCounter = 1;
    const newCardsPairs: CardData[] = selected
      .flatMap((item) => {
        const texts = currentLanguage === 'en' ? item.infoTextsEn : item.infoTexts;
        if (!texts || texts.length === 0) return []; 
        
        if (!usedInfoTextsRef.current[item.pairId]) {
            usedInfoTextsRef.current[item.pairId] = [];
        }

        let availableIndices = texts.map((_, index) => index)
                                    .filter(i => !usedInfoTextsRef.current[item.pairId].includes(i));

        if (availableIndices.length === 0) {
            usedInfoTextsRef.current[item.pairId] = [];
            availableIndices = texts.map((_, index) => index);
        }

        const shuffledAvailableIndices = shuffleArray(availableIndices);
        const pickedIndex = shuffledAvailableIndices[0];

        usedInfoTextsRef.current[item.pairId].push(pickedIndex);

        return [
          { id: idCounter++, pairId: item.pairId, type: "character" as const, image: item.image },
          { id: idCounter++, pairId: item.pairId, type: "info" as const, text: texts[pickedIndex] },
        ];
      });

    const newCards = shuffleArray(newCardsPairs);

    setShuffledCards(newCards);
    setOpenedCards([]);
    setMatchedCards([]);
    setErrors(0); 
    setSeconds(0);
    setGameFinished(false);
    setReward(null);
    setShowGameOverModal(false);
  };

  useEffect(() => {
    if (dbCharacters.length > 0 && isMounted) {
      initializeLevel(currentLevel, dbCharacters);
    }
  }, [currentLevel, dbCharacters, currentLanguage, isMounted]);

  useEffect(() => {
    if (gameFinished || shuffledCards.length === 0 || isLoading || showIntroModal || showGameOverModal || !isMounted) return;
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [gameFinished, shuffledCards, isLoading, showIntroModal, showGameOverModal, isMounted]);

  const handleShareClick = async () => {
    if (!reward) return;
    setIsSharing(true);

    const shareTitle = currentLanguage === 'en' ? "Tower Voices Match Challenge" : "🏆 تحدي أصوات البرج 🏆";
    const attemptsTitle = currentLanguage === 'en' ? "Errors" : "🎯 الأخطاء";
    const levelTitle = currentLanguage === 'en' ? "Level" : "✨ المستوى";
    const secondsTitle = currentLanguage === 'en' ? "sec" : "ثانية";
    const winMsg = currentLanguage === 'en' ? "I finished the challenge and got card" : "طابقت الشخصيات بنجاح وحصلت على بطاقة";
    const challengeMsg = currentLanguage === 'en' ? "Can you beat my record? Play from here 👇" : "هل يمكنك تحطيم رقمي؟ جرب التحدي من هنا 👇";

    const shareText = `${shareTitle}\n${winMsg} (${currentLanguage === 'en' ? reward.nameEn : reward.name})! 🎉\n\n${levelTitle}: ${currentLevel}\n⏱️ Time: ${seconds} ${secondsTitle}\n${attemptsTitle}: ${errors}\n\n${challengeMsg}\nhttps://towervoices.online/activities/match-character?lang=${currentLanguage}`;

    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert(currentLanguage === 'en' ? "✅ Copied to clipboard!" : "✅ تم نسخ النتيجة بنجاح!");
      }
    } catch (error) {
      console.log("Share cancelled", error);
    } finally {
      setIsSharing(false);
    }
  };

  const getRandomReward = (mistakesCount: number) => {
    if (dbRewards.length === 0) return null;
    let legendaryChance = 5; let rareChance = 25;       
    if (mistakesCount >= 0 && mistakesCount <= 5) { legendaryChance = 45; rareChance = 65; } 
    else if (mistakesCount >= 6 && mistakesCount <= 10) { legendaryChance = 45; rareChance = 50; } 
    else if (mistakesCount >= 11 && mistakesCount <= 20) { legendaryChance = 18; rareChance = 35; } 
    else { legendaryChance = 5; rareChance = 25; }

    const roll = Math.random() * 100;
    let targetRarity = 'common';
    if (roll <= legendaryChance) targetRarity = 'legendary'; 
    else if (roll <= legendaryChance + rareChance) targetRarity = 'rare'; 
    else targetRarity = 'common'; 

    const filteredRewards = dbRewards.filter(r => r.rarity === targetRarity);
    let pool = filteredRewards.length > 0 ? filteredRewards : dbRewards;
    
    if (lastWonReward && pool.length > 1) {
      const withoutLastReward = pool.filter(r => r.name !== lastWonReward);
      if (withoutLastReward.length > 0) pool = withoutLastReward;
    }

    const pickedReward = pool[Math.floor(Math.random() * pool.length)];
    setLastWonReward(pickedReward.name);
    return pickedReward;
  };

  const handleCardClick = (cardId: number) => {
    if (openedCards.includes(cardId) || matchedCards.includes(cardId) || openedCards.length >= 2 || gameFinished) return;
    
    const newOpened = [...openedCards, cardId];
    setOpenedCards(newOpened);

    if (newOpened.length === 2) {
      const firstCard = shuffledCards.find((c) => c.id === newOpened[0]);
      const secondCard = shuffledCards.find((c) => c.id === newOpened[1]);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        const newMatched = [...matchedCards, ...newOpened];
        setMatchedCards(newMatched);
        setOpenedCards([]); 

        if (newMatched.length === shuffledCards.length) {
          const wonReward = getRandomReward(errors); 
          setReward(wonReward);
          setGameFinished(true);
          setTimeout(() => setShowRewardModal(true), 500);
        }
      } else {
        const newErrors = errors + 1;
        setErrors(newErrors);
        
        if (newErrors >= MAX_MISTAKES) {
          setGameFinished(true);
          playSound('/sounds/larp-monster.mp3'); // 🔥 تشغيل صوت الوحش فوراً عند الخسارة
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 300);
        }

        setTimeout(() => setOpenedCards([]), 1000);
      }
    }
  };

  const handleNextLevel = () => {
    setShowRewardModal(false);
    if (currentLevel < MAX_LEVEL) setCurrentLevel((prev) => prev + 1);
    else setCurrentLevel(1);
  };

  const handleRestartGame = () => {
    setShowGameOverModal(false);
    if (currentLevel !== 1) {
      setCurrentLevel(1); 
    } else {
      initializeLevel(1, dbCharacters);
    }
  };

  // 🔥 دالة لبدء التحدي وتجهيز المتصفح للأصوات
  const handleStartChallenge = () => {
      // هذه الخطوة تخبر المتصفح أن المستخدم تفاعل، مما يسهل تشغيل الأصوات لاحقاً
      const audio = new Audio('/sounds/larp-monster.mp3');
      audio.volume = 0; // صامت
      audio.play().catch(()=> {}); 
      
      setShowIntroModal(false);
  }

  if (!isMounted || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#312e81_0%,#000_60%)] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  return (
    <main 
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'} 
      className="min-h-screen flex flex-col p-4 md:p-8 bg-[radial-gradient(circle_at_top,#312e81_0%,#000_60%)] text-white relative z-0"
    >
      <div className={`absolute top-4 md:top-6 ${currentLanguage === 'ar' ? 'left-4 md:left-12' : 'right-4 md:right-12'} z-[60]`}>
        <button 
            onClick={() => {
              const nextLang = currentLanguage === 'ar' ? 'en' : 'ar';
              setCurrentLanguage(nextLang);
              localStorage.setItem('siteLang', nextLang);
            }}
            className="flex items-center gap-2 border border-indigo-500/30 bg-indigo-900/40 rounded-full px-3 py-1.5 md:px-4 md:py-2 hover:bg-indigo-900/60 transition-colors text-xs md:text-sm font-semibold backdrop-blur-md shadow-lg"
        >
            <span className="w-4 h-4 bg-transparent border border-white rounded-full flex items-center justify-center text-[10px]">🌐</span>
            {t.langName}
        </button>
      </div>

      {showGameOverModal && (
        <div className="fixed inset-0 bg-red-950/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-zinc-950 border-2 border-red-600 rounded-3xl p-6 md:p-8 text-center w-full max-w-md shadow-[0_0_100px_rgba(220,38,38,0.5)] animate-in zoom-in-75 duration-700 my-8">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-red-500 animate-pulse">{t.gameOverTitle}</h2>
            
            <div className="relative mx-auto w-48 md:w-56 h-48 md:h-56 flex justify-center items-center mb-6 overflow-hidden rounded-2xl border-4 border-red-900/50 shadow-2xl">
              <div className="absolute inset-0 bg-red-600 blur-[60px] opacity-30 animate-pulse"></div>
              {larpMonsterImage ? (
                 <img src={larpMonsterImage} alt="Larp Monster" className="w-full h-full object-cover relative z-10" />
              ) : (
                 <div className="text-6xl animate-bounce">👹</div>
              )}
            </div>
            
            <p className="text-base md:text-lg text-zinc-300 font-bold mb-8 leading-relaxed">
              {t.gameOverDesc}
            </p>

            <button 
              onClick={handleRestartGame} 
              className="w-full bg-red-700 hover:bg-red-600 transition-colors text-white py-4 rounded-xl font-bold text-lg md:text-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95"
            >
              {t.restartGame} 🔄
            </button>
          </div>
        </div>
      )}

      {showIntroModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-3xl p-6 md:p-10 text-center w-full max-w-lg shadow-[0_0_50px_rgba(79,70,229,0.15)] animate-in zoom-in-95 duration-300 my-8">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl">🎮</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white">{t.gameTitle}</h2>
            <p className="text-zinc-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">{t.subTitle}</p>

            <div className="bg-black/40 rounded-2xl p-4 md:p-5 mb-6 md:mb-8 text-start space-y-4 text-sm md:text-base border border-zinc-800">
              <h3 className="font-bold text-indigo-400 text-center mb-4 md:mb-5">{t.getCardsTitle}</h3>
              
              <p className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 flex-shrink-0 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                <span className="text-zinc-300"><b className="text-white">{t.perfectTitle}</b> {t.perfect}</span>
              </p>
              
              <p className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                <span className="text-zinc-300"><b className="text-white">{t.goodTitle}</b> {t.good}</span>
              </p>
              
              <p className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-green-400 flex-shrink-0 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                <span className="text-zinc-300">{t.average}</span>
              </p>
            </div>

            <button
              onClick={handleStartChallenge}
              className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all text-white py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
            >
              {t.startChallenge}
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto flex-shrink-0 mt-14 md:mt-4 mb-2 md:mb-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center md:text-start text-indigo-400">
          {t.gameTitle}
        </h1>
      </div>

      {!showIntroModal && (
        <>
          <div className="hidden md:flex flex-wrap justify-between items-center mb-6 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 gap-4 w-full max-w-6xl mx-auto mt-4">
             <div className="flex items-center gap-3">
                <span className="bg-indigo-950/60 text-indigo-400 font-bold px-4 py-2 rounded-lg border border-indigo-900/50 text-sm">
                  {t.level} {currentLevel}
                </span>
             </div>
             
             <div className="flex gap-3 text-sm font-semibold">
                <span className="bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700 flex items-center gap-1">
                  ⏱️ {seconds} {t.seconds}
                </span>
                <span className={`px-4 py-2 rounded-lg border flex items-center gap-1 transition-colors ${errors >= 12 ? 'bg-red-950 border-red-500 text-red-400 animate-pulse' : 'bg-zinc-800 border-zinc-700'}`}>
                  🎯 {t.errors}: {errors}
                </span>
             </div>
          </div>

          <div className="md:hidden fixed bottom-0 left-0 w-full z-[45] bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 p-3 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
             <div className="flex justify-between items-center max-w-sm mx-auto">
                <span className="bg-indigo-950/60 text-indigo-400 font-bold px-3 py-1.5 rounded-lg border border-indigo-900/50 text-xs">
                  {t.level} {currentLevel}
                </span>
                <div className="flex gap-2 text-xs font-semibold">
                   <span className="bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-1">
                     ⏱️ {seconds}
                   </span>
                   <span className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${errors >= 12 ? 'bg-red-950 border-red-500 text-red-400 animate-pulse' : 'bg-zinc-800 border-zinc-700'}`}>
                     🎯 {errors}
                   </span>
                </div>
             </div>
          </div>
        </>
      )}

      <div className="flex-1 flex items-center justify-center w-full pb-20 md:pb-8 mt-4 md:mt-0">
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
                      <img src={card.image} alt="character" className="w-full h-full object-contain pointer-events-none animate-in fade-in zoom-in duration-300" />
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

      {showRewardModal && reward && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-3xl p-6 md:p-8 text-center w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t.winTitle}</h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-zinc-400">{t.gotCard}</p>

            <div className="relative mx-auto w-40 md:w-60 flex justify-center items-center mb-4 md:mb-6 mt-2 md:-mt-4">
              {reward.rarity === 'legendary' && <div className="absolute inset-0 bg-yellow-500 blur-[40px] opacity-40 rounded-full animate-pulse scale-110"></div>}
              {reward.rarity === 'rare' && <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-40 rounded-full animate-pulse scale-110"></div>}
              
              <img src={reward.image} alt={currentLanguage === 'en' ? reward.nameEn : reward.name} className="w-full h-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-500" />
            </div>
            
            <p className={`text-xl md:text-2xl font-bold ${reward.rarity === 'legendary' ? 'text-yellow-400' : reward.rarity === 'rare' ? 'text-blue-400' : 'text-white'}`}>
              {currentLanguage === 'en' ? reward.nameEn : reward.name}
            </p>
            <p className="text-[10px] md:text-xs mt-1 text-zinc-500 uppercase tracking-widest">{t.rewardRarity}: {currentLanguage === 'en' ? reward.rarity.toUpperCase() : (reward.rarity === 'common' ? 'عادي' : reward.rarity === 'rare' ? 'نادر' : 'أسطوري')}</p>

            <div className="mt-4 md:mt-6 bg-black/30 p-3 md:p-4 rounded-xl space-y-2 md:space-y-3 text-sm text-zinc-300 text-start border border-zinc-800">
              <p className="flex justify-between"><span>⏱️ {currentLanguage === 'en' ? 'Time' : 'الزمن'}:</span> <span className="font-bold text-white">{seconds} {t.seconds}</span></p>
              <p className="flex justify-between"><span>🎯 {t.errors}:</span> <span className="font-bold text-white">{errors}</span></p>
            </div>

            <div className="mt-4 md:mt-6 flex flex-col gap-2 md:gap-3">
              <button onClick={handleShareClick} disabled={isSharing} className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors text-white py-3 md:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm md:text-base">
                {t.share}
              </button>
              <button onClick={handleNextLevel} className="w-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors py-3 md:py-3.5 rounded-xl font-semibold text-sm md:text-base text-zinc-300 block">
                {currentLevel < MAX_LEVEL ? t.nextLevel : t.replay}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}