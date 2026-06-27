"use client";

import { useState, useEffect } from "react";
import { client } from "@/app/sanity.client"; 
import Link from "next/link";

interface CharacterFromSanity {
  name: string;
  nameEn: string;
  image: string;
  hints: string[];
  hintsEn: string[];
}

interface RewardFromSanity {
  name: string;
  nameEn: string;
  image: string;
  rarity: string;
}

const uiTexts = {
  ar: {
    gameTitle: "خمن الشخصية",
    subTitle: "هل يمكنك معرفة الشخصية من خلال التلميحات؟",
    hintNumber: "تلميح رقم",
    showNextHint: "👀 أظهر تلميحاً آخر",
    noMoreHints: "لا يوجد تلميحات أخرى!",
    selectAnswer: "من تكون هذه الشخصية؟",
    preparing: "جاري تجهيز التحدي...",
    winTitle: "🎉 إجابة صحيحة!",
    gotCard: "حصلت على بطاقة جديدة",
    perfect: "يمنحك فرصة عالية جداً لبطاقة أسطورية!",
    good: "يمنحك فرصة لبطاقة نادرة.",
    average: "يمنحك بطاقات عادية، حاول تقليل التلميحات!",
    rewardRarity: "الندرة",
    share: "📤 مشاركة النتيجة",
    nextRound: "الجولة التالية ←",
    langName: "English",
    getCardsTitle: "كيف تحصل على البطاقات؟ 🃏",
    perfectTitle: "تخمين سريع (تلميح 1 - 0 أخطاء)",
    goodTitle: "تخمين جيد (استخدام التلميحات)",
    usedHints: "التلميحات المستخدمة",
    wrongGuesses: "تخمينات خاطئة",
    notEnoughData: "عذراً، لم نجد شخصيات تحتوي على تلميحات في قاعدة البيانات."
  },
  en: {
    gameTitle: "Guess the Character",
    subTitle: "Can you figure out the character from the hints?",
    hintNumber: "Hint #",
    showNextHint: "👀 Show another hint",
    noMoreHints: "No more hints available!",
    selectAnswer: "Who is this character?",
    preparing: "Preparing Challenge...",
    winTitle: "🎉 Correct Answer!",
    gotCard: "You obtained a new card",
    perfect: "gives a very high chance of a Legendary card!",
    good: "gives a chance of a Rare card.",
    average: "grants Common cards. Try using fewer hints!",
    rewardRarity: "Rarity",
    share: "📤 Share Result",
    nextRound: "Next Round ←",
    langName: "العربية",
    getCardsTitle: "Get Cards! 🃏",
    perfectTitle: "Fast Guess (1 Hint - 0 Errors)",
    goodTitle: "Good Guess (Used more hints)",
    usedHints: "Hints Used",
    wrongGuesses: "Wrong Guesses",
    notEnoughData: "Sorry, no characters with hints found in the database."
  }
};

export default function GuessCharacterPage() {
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
        if (browserLang && !browserLang.toLowerCase().startsWith('ar')) targetLang = 'en';
      }
      
      setCurrentLanguage(targetLang);
      setIsMounted(true); 
    }
  }, []);

  const t = uiTexts[currentLanguage]; 

  const [dbCharacters, setDbCharacters] = useState<CharacterFromSanity[]>([]);
  const [dbRewards, setDbRewards] = useState<RewardFromSanity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Game State
  const [targetChar, setTargetChar] = useState<CharacterFromSanity | null>(null);
  const [options, setOptions] = useState<CharacterFromSanity[]>([]);
  const [revealedHintsCount, setRevealedHintsCount] = useState(1);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [guessedWrongOptions, setGuessedWrongOptions] = useState<string[]>([]);
  
  const [reward, setReward] = useState<any>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchSanityData = async () => {
      try {
        const charQuery = `*[_type == "activityCharacter"]{
          name, nameEn,      
          "image": image.asset->url,
          hints, hintsEn 
        }`;
        
        const rewardQuery = `*[_type == "activityReward"]{
          name, nameEn,      
          "image": image.asset->url,
          rarity
        }`;

        const [charData, rewardData] = await Promise.all([
          client.fetch(charQuery),
          client.fetch(rewardQuery)
        ]);

        // نفلتر الشخصيات لنتأكد أنها تملك تلميحات
        const validChars = charData.filter((c: any) => c.hints && c.hints.length > 0);
        
        setDbCharacters(validChars);
        setDbRewards(rewardData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchSanityData();
  }, []);

  const initializeRound = (chars: CharacterFromSanity[]) => {
    if (chars.length < 4) return; // نحتاج على الأقل 4 شخصيات للخيارات

    // 1. نختار شخصية الهدف عشوائياً
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    const target = shuffled[0];

    // 2. نختار 3 شخصيات أخرى كخيارات خاطئة
    const distractors = shuffled.slice(1, 4);

    // 3. ندمجهم ونخلطهم لكي لا يكون الهدف دائماً في نفس المكان
    const finalOptions = [target, ...distractors].sort(() => Math.random() - 0.5);

    setTargetChar(target);
    setOptions(finalOptions);
    setRevealedHintsCount(1);
    setWrongAttempts(0);
    setGuessedWrongOptions([]);
    setReward(null);
  };

  useEffect(() => {
    if (dbCharacters.length >= 4 && isMounted) {
      initializeRound(dbCharacters);
    }
  }, [dbCharacters, isMounted, currentLanguage]);

  const handleRevealHint = () => {
    if (!targetChar) return;
    const hintsList = currentLanguage === 'en' && targetChar.hintsEn ? targetChar.hintsEn : targetChar.hints;
    if (revealedHintsCount < hintsList.length) {
      setRevealedHintsCount(prev => prev + 1);
    }
  };

  const calculateReward = (hintsUsed: number, mistakes: number) => {
    if (dbRewards.length === 0) return null;
    
    // مجموع العقوبات (تلميح إضافي = عقوبة، خطأ = عقوبة مضاعفة)
    const penaltyScore = (hintsUsed - 1) + (mistakes * 2);

    let legendaryChance = 5; let rareChance = 25;     
    
    if (penaltyScore === 0) { legendaryChance = 35; rareChance = 45; } // مثالي
    else if (penaltyScore <= 2) { legendaryChance = 20; rareChance = 40; } // جيد
    else if (penaltyScore <= 4) { legendaryChance = 10; rareChance = 30; } // متوسط
    else { legendaryChance = 2; rareChance = 15; } // ضعيف

    const roll = Math.random() * 100;
    let targetRarity = 'common';
    if (roll <= legendaryChance) targetRarity = 'legendary'; 
    else if (roll <= legendaryChance + rareChance) targetRarity = 'rare'; 
    else targetRarity = 'common'; 

    const filteredRewards = dbRewards.filter(r => r.rarity === targetRarity);
    const pool = filteredRewards.length > 0 ? filteredRewards : dbRewards;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleGuess = (charName: string) => {
    if (!targetChar) return;

    if (charName === targetChar.name) {
      // إجابة صحيحة!
      const wonReward = calculateReward(revealedHintsCount, wrongAttempts);
      setReward(wonReward);
      setTimeout(() => setShowRewardModal(true), 400);
    } else {
      // إجابة خاطئة
      if (!guessedWrongOptions.includes(charName)) {
        setGuessedWrongOptions(prev => [...prev, charName]);
        setWrongAttempts(prev => prev + 1);
      }
    }
  };

  const handleShareClick = async () => {
    if (!reward) return;
    setIsSharing(true);

    const shareTitle = currentLanguage === 'en' ? "Tower Voices Guess Challenge" : "🏆 تحدي أصوات البرج 🏆";
    const hintsTitle = currentLanguage === 'en' ? "Hints Used" : "💡 التلميحات";
    const errorsTitle = currentLanguage === 'en' ? "Errors" : "🎯 الأخطاء";
    const winMsg = currentLanguage === 'en' ? "I guessed the character and got card" : "خمنت الشخصية بنجاح وحصلت على بطاقة";
    const challengeMsg = currentLanguage === 'en' ? "Can you beat my record? Play here 👇" : "هل يمكنك تحطيم رقمي؟ جرب التحدي من هنا 👇";

    const shareText = `${shareTitle}\n${winMsg} (${currentLanguage === 'en' ? reward.nameEn : reward.name})! 🎉\n\n${hintsTitle}: ${revealedHintsCount}\n${errorsTitle}: ${wrongAttempts}\n\n${challengeMsg}\nhttps://towervoices.online/activities/guess-character?lang=${currentLanguage}`;

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

  if (!isMounted || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  // إذا لم يكن هناك شخصيات كافية بتلميحات
  if (dbCharacters.length < 4) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-6 text-center">
        <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl">
          <p className="text-red-400 text-lg font-bold">{t.notEnoughData}</p>
          <Link href="/activities" className="mt-4 inline-block text-zinc-400 hover:text-white underline">العودة للمركز</Link>
        </div>
      </main>
    );
  }

  const currentHintsList = targetChar ? (currentLanguage === 'en' && targetChar.hintsEn && targetChar.hintsEn.length > 0 ? targetChar.hintsEn : targetChar.hints) : [];

  return (
    <main dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col p-4 md:p-8 bg-[#0a0a0a] text-white relative">
      
      {/* زر اللغة */}
      <div className={`absolute top-6 ${currentLanguage === 'ar' ? 'left-6 md:left-12' : 'right-6 md:right-12'} z-50`}>
        <button 
            onClick={() => {
              const nextLang = currentLanguage === 'ar' ? 'en' : 'ar';
              setCurrentLanguage(nextLang);
              localStorage.setItem('siteLang', nextLang);
            }}
            className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-900/40 rounded-full px-4 py-2 hover:bg-emerald-900/60 transition-colors text-sm font-semibold backdrop-blur-md shadow-lg"
        >
            <span className="w-4 h-4 text-xs flex items-center justify-center">🌐</span>
            {t.langName}
        </button>
      </div>

      {/* شاشة التعليمات */}
      {showIntroModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-3xl p-6 md:p-10 text-center w-full max-w-lg shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">🤔</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">{t.gameTitle}</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-sm md:text-base">{t.subTitle}</p>

            <div className="bg-black/40 rounded-2xl p-5 mb-8 text-start space-y-4 text-sm md:text-base border border-zinc-800">
              <h3 className="font-bold text-emerald-400 text-center mb-5">{t.getCardsTitle}</h3>
              <p className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                <span className="text-zinc-300"><b className="text-white">{t.perfectTitle}</b> {t.perfect}</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                <span className="text-zinc-300"><b className="text-white">{t.goodTitle}</b> {t.good}</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                <span className="text-zinc-300">{t.average}</span>
              </p>
            </div>

            <button
              onClick={() => setShowIntroModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 transition-all text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
            >
              🚀 {t.gameTitle}
            </button>
          </div>
        </div>
      )}

      {/* واجهة اللعب */}
      <div className="w-full max-w-4xl mx-auto mt-16 flex flex-col flex-1">
        
        <div className="flex justify-between items-center mb-8 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
           <h1 className="text-xl md:text-2xl font-bold text-emerald-400">{t.gameTitle}</h1>
           <div className="flex gap-4 text-sm font-semibold">
              <span className="bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">💡 {t.usedHints}: {revealedHintsCount}</span>
              <span className="bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">🎯 {t.wrongGuesses}: {wrongAttempts}</span>
           </div>
        </div>

        {/* عرض التلميحات */}
        <div className="flex-1 flex flex-col gap-4 mb-8">
          {currentHintsList.slice(0, revealedHintsCount).map((hint, index) => (
            <div key={index} className="bg-zinc-800/80 border border-zinc-700 p-5 rounded-2xl shadow-lg animate-in slide-in-from-bottom-4">
              <div className="text-emerald-500 text-sm font-bold mb-2">{t.hintNumber} {index + 1}</div>
              <p className="text-lg md:text-xl text-zinc-200 leading-relaxed">{hint}</p>
            </div>
          ))}
          
          {revealedHintsCount < currentHintsList.length ? (
            <button 
              onClick={handleRevealHint}
              className="self-center mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-3 rounded-xl border border-zinc-600 transition-all font-semibold"
            >
              {t.showNextHint}
            </button>
          ) : (
            <div className="self-center mt-4 text-zinc-500 text-sm">{t.noMoreHints}</div>
          )}
        </div>

        {/* خيارات الإجابة */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl mt-auto">
          <h3 className="text-center font-bold text-zinc-400 mb-6">{t.selectAnswer}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((option) => {
              const isWrong = guessedWrongOptions.includes(option.name);
              const charDisplayName = currentLanguage === 'en' && option.nameEn ? option.nameEn : option.name;

              return (
                <button
                  key={option.name}
                  onClick={() => handleGuess(option.name)}
                  disabled={isWrong}
                  className={`
                    p-4 rounded-xl border-2 transition-all font-bold text-lg flex items-center justify-between
                    ${isWrong ? 'bg-red-950/20 border-red-900/50 text-red-500/50 cursor-not-allowed line-through' 
                              : 'bg-zinc-800 border-zinc-700 hover:border-emerald-500 hover:bg-emerald-950/30 text-white'}
                  `}
                >
                  {charDisplayName}
                  {isWrong && <span>❌</span>}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* نافذة الفوز */}
      {showRewardModal && reward && targetChar && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-3xl p-8 text-center w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{t.winTitle}</h2>
            
            {/* صورة الشخصية التي تم تخمينها */}
            <div className="w-24 h-24 mx-auto my-4 rounded-full overflow-hidden border-4 border-zinc-800 shadow-lg">
                <img src={targetChar.image} alt="character" className="w-full h-full object-cover" />
            </div>
            <p className="text-xl font-bold text-white mb-6">{currentLanguage === 'en' ? targetChar.nameEn : targetChar.name}</p>

            <div className="relative mx-auto w-48 flex justify-center items-center mb-6">
              {reward.rarity === 'legendary' && <div className="absolute inset-0 bg-yellow-500 blur-[40px] opacity-40 rounded-full animate-pulse scale-110"></div>}
              {reward.rarity === 'rare' && <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-40 rounded-full animate-pulse scale-110"></div>}
              <img src={reward.image} alt="card" className="w-full h-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform" />
            </div>
            
            <p className={`text-2xl font-bold ${reward.rarity === 'legendary' ? 'text-yellow-400' : reward.rarity === 'rare' ? 'text-blue-400' : 'text-white'}`}>
              {currentLanguage === 'en' ? reward.nameEn : reward.name}
            </p>
            <p className="text-xs mt-1 text-zinc-500 uppercase tracking-widest">{t.rewardRarity}: {currentLanguage === 'en' ? reward.rarity.toUpperCase() : (reward.rarity === 'common' ? 'عادي' : reward.rarity === 'rare' ? 'نادر' : 'أسطوري')}</p>

            <div className="mt-6 bg-black/40 p-4 rounded-xl space-y-3 text-sm text-zinc-300 text-start border border-zinc-800">
              <p className="flex justify-between"><span>💡 {t.usedHints}:</span> <span>{revealedHintsCount}</span></p>
              <p className="flex justify-between"><span>🎯 {t.wrongGuesses}:</span> <span>{wrongAttempts}</span></p>
            </div>

            <div className="mt-6 space-y-3">
              <button onClick={handleShareClick} disabled={isSharing} className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2">
                {t.share}
              </button>
              <button onClick={() => initializeRound(dbCharacters)} className="w-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors py-3.5 rounded-xl font-semibold">
                {t.nextRound}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}