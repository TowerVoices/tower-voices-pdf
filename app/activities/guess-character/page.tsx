"use client";

import { useState, useEffect, useRef } from "react";
import { client } from "@/app/sanity.client"; 
import Link from "next/link";

interface CharacterFromSanity {
  name: string;
  nameEn: string;
  image: string;
  hints: string[];
  hintsEn: string[];
  echidnaHints?: string[];   
  echidnaHintsEn?: string[]; 
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
    hintNumber: "تلميح",
    showNextHint: "👀 أظهر تلميحاً آخر",
    noMoreHints: "لا يوجد تلميحات أخرى!",
    selectAnswer: "من تكون هذه الشخصية؟",
    preparing: "جاري تجهيز التحدي...",
    gotCard: "حصلت على بطاقة جديدة",
    rewardRarity: "الندرة",
    share: "📤 مشاركة النتيجة",
    langName: "English",
    getCardsTitle: "قواعد الحصول على البطاقات 🃏",
    rule1Title: "مستوى الصعوبة:",
    rule1Desc: "كلما اخترت مستوى أصعب (مثل إيكيدنا)، زادت فرصتك بشكل كبير للحصول على بطاقات أسطورية ونادرة.",
    rule2Title: "الأخطاء والتلميحات:",
    rule2Desc: "كل تخمين خاطئ أو استخدام لتلميح إضافي يقلل من هذه النسبة تدريجياً.",
    rule3Title: "البطاقات العادية:",
    rule3Desc: "إذا كانت أخطاؤك كثيرة أو اعتمدت كلياً على المستوى السهل، فستحصل غالباً على بطاقات عادية.",
    usedHints: "التلميحات",
    wrongGuesses: "الأخطاء",
    totalHints: "إجمالي التلميحات",
    totalErrors: "إجمالي الأخطاء",
    notEnoughData: "عذراً، لم نجد شخصيات تحتوي على تلميحات في قاعدة البيانات.",
    startGameBtn: "فهمت، لنبدأ 🚀",
    selectLevel: "اختر مستوى الصعوبة:",
    levelLarp: "لارب (Larp)",
    levelLarpDesc: "15 ثانية للتخمين",
    levelSubaru: "سوبارو (Subaru)",
    levelSubaruDesc: "10 ثواني للتخمين",
    levelEchidna: "إيكيدنا (Echidna)",
    levelEchidnaDesc: "5 ثواني، تلميح صعب جداً وبدون إضافات!",
    echidnaConstraint: "وضع إيكيدنا: التلميحات الإضافية معطلة!",
    timeUp: "انتهى الوقت!",
    correctAnswerWas: "الإجابة الصحيحة كانت:",
    tryAgain: "إعادة المحاولة 🔄",
    changeLevel: "تغيير المستوى",
    seconds: "ثانية",
    round: "الجولة",
    of: "من",
    levelCompleteTitle: "🎉 اكتمل التحدي!",
    levelCompleteDesc: "لقد أتممت 5 جولات بنجاح وحصلت على مكافأتك.",
    backToMenu: "العودة للمركز 🏠"
  },
  en: {
    gameTitle: "Guess the Character",
    subTitle: "Can you figure out the character from the hints?",
    hintNumber: "Hint",
    showNextHint: "👀 Show another hint",
    noMoreHints: "No more hints available!",
    selectAnswer: "Who is this character?",
    preparing: "Preparing Challenge...",
    gotCard: "You obtained a new card",
    rewardRarity: "Rarity",
    share: "📤 Share Result",
    langName: "العربية",
    getCardsTitle: "How to get Cards? 🃏",
    rule1Title: "Difficulty Level:",
    rule1Desc: "Choosing harder levels (like Echidna) massively increases your chance for Legendary and Rare cards.",
    rule2Title: "Hints & Mistakes:",
    rule2Desc: "Every wrong guess or extra hint used drops your chance for high-rarity cards.",
    rule3Title: "Common Cards:",
    rule3Desc: "Playing on easy or making many mistakes will likely result in Common cards.",
    usedHints: "Hints",
    wrongGuesses: "Errors",
    totalHints: "Total Hints",
    totalErrors: "Total Errors",
    notEnoughData: "Sorry, no characters with hints found in the database.",
    startGameBtn: "Got it, Let's go! 🚀",
    selectLevel: "Select Difficulty:",
    levelLarp: "Larp",
    levelLarpDesc: "15 seconds to guess",
    levelSubaru: "Subaru",
    levelSubaruDesc: "10 seconds to guess",
    levelEchidna: "Echidna",
    levelEchidnaDesc: "5 seconds, very hard hint, no extras!",
    echidnaConstraint: "Echidna Mode: Extra hints disabled!",
    timeUp: "Time's Up!",
    correctAnswerWas: "The correct answer was:",
    tryAgain: "Try Again 🔄",
    changeLevel: "Change Level",
    seconds: "sec",
    round: "Round",
    of: "of",
    levelCompleteTitle: "🎉 Challenge Completed!",
    levelCompleteDesc: "You completed 5 rounds and claimed your reward.",
    backToMenu: "Back to Center 🏠"
  }
};

type Difficulty = 'larp' | 'subaru' | 'echidna' | null;
const MAX_ROUNDS = 5;

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

  // Game & Timer State
  const [difficulty, setDifficulty] = useState<Difficulty>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [gameFinished, setGameFinished] = useState(false); 

  const [currentRound, setCurrentRound] = useState(1);
  const [usedChars, setUsedChars] = useState<string[]>([]);
  const [shuffledHintIndices, setShuffledHintIndices] = useState<number[]>([]); 

  const [targetChar, setTargetChar] = useState<CharacterFromSanity | null>(null);
  const [options, setOptions] = useState<CharacterFromSanity[]>([]);
  const [revealedHintsCount, setRevealedHintsCount] = useState(1);
  
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [guessedWrongOptions, setGuessedWrongOptions] = useState<string[]>([]);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [totalWrongGuesses, setTotalWrongGuesses] = useState(0);
  
  const [correctGuess, setCorrectGuess] = useState<string | null>(null);

  const [reward, setReward] = useState<any>(null);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [introStep, setIntroStep] = useState<1 | 2>(1); 
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchSanityData = async () => {
      try {
        const charQuery = `*[_type == "activityCharacter"]{
          name, nameEn,      
          "image": image.asset->url,
          hints, hintsEn,
          echidnaHints, echidnaHintsEn
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

  const initializeRound = (chars: CharacterFromSanity[], used: string[], currentDiff: Difficulty) => {
    if (chars.length < 4) return;
    
    let availableChars = chars.filter(c => !used.includes(c.name));
    if (availableChars.length === 0) {
        availableChars = [...chars];
        setUsedChars([]);
    }

    const shuffledAvailable = [...availableChars].sort(() => Math.random() - 0.5);
    const target = shuffledAvailable[0];

    setUsedChars(prev => [...prev, target.name]);

    const distractors = chars.filter(c => c.name !== target.name).sort(() => Math.random() - 0.5).slice(0, 3);
    const finalOptions = [target, ...distractors].sort(() => Math.random() - 0.5);

    let hintsLen = 0;
    if (currentDiff === 'echidna') {
       hintsLen = target.echidnaHints?.length || target.hints?.length || 0;
    } else {
       hintsLen = target.hints?.length || 0;
    }
    const randomizedIndices = Array.from({length: hintsLen}, (_, i) => i).sort(() => Math.random() - 0.5);

    setShuffledHintIndices(randomizedIndices);
    setTargetChar(target);
    setOptions(finalOptions);
    setRevealedHintsCount(1);
    setWrongAttempts(0);
    setGuessedWrongOptions([]);
    setCorrectGuess(null);
    setIsTimeUp(false);
    setGameFinished(false);
  };

  const startGame = (selectedLevel: Difficulty) => {
    setDifficulty(selectedLevel);
    setCurrentRound(1); 
    setUsedChars([]);   
    setTotalHintsUsed(0);
    setTotalWrongGuesses(0);
    
    if (selectedLevel === 'larp') setTimeLeft(15);
    else if (selectedLevel === 'subaru') setTimeLeft(10);
    else if (selectedLevel === 'echidna') setTimeLeft(5);
    
    setShowIntroModal(false);
    setShowLevelCompleteModal(false);
    initializeRound(dbCharacters, [], selectedLevel);
  };

  useEffect(() => {
    if (showIntroModal || showLevelCompleteModal || isTimeUp || gameFinished || !difficulty || isLoading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showIntroModal, showLevelCompleteModal, isTimeUp, gameFinished, difficulty, isLoading]);


  const getCurrentHints = () => {
    if (!targetChar) return [];
    
    let baseHints: string[] = [];
    if (difficulty === 'echidna') {
        baseHints = currentLanguage === 'en' && targetChar.echidnaHintsEn && targetChar.echidnaHintsEn.length > 0 
            ? targetChar.echidnaHintsEn 
            : (targetChar.echidnaHints && targetChar.echidnaHints.length > 0 ? targetChar.echidnaHints : []);
        
        if (!baseHints || baseHints.length === 0) {
            baseHints = currentLanguage === 'en' && targetChar.hintsEn && targetChar.hintsEn.length > 0 
                ? targetChar.hintsEn 
                : targetChar.hints;
        }
    } else {
        baseHints = currentLanguage === 'en' && targetChar.hintsEn && targetChar.hintsEn.length > 0 
            ? targetChar.hintsEn 
            : targetChar.hints;
    }

    if (!baseHints) return [];
    return shuffledHintIndices.map(i => baseHints[i]).filter(h => h !== undefined);
  };

  const currentHintsList = getCurrentHints();

  const handleRevealHint = () => {
    if (!targetChar || difficulty === 'echidna') return; 
    if (revealedHintsCount < currentHintsList.length) {
      setRevealedHintsCount(prev => prev + 1);
    }
  };

  const calculateFinalReward = (hintsUsed: number, mistakes: number, currentDifficulty: Difficulty) => {
    if (dbRewards.length === 0) return null;
    
    let legendaryChance = 0;
    let rareChance = 0;

    if (currentDifficulty === 'echidna') {
      legendaryChance = 60; rareChance = 30; 
    } else if (currentDifficulty === 'subaru') {
      legendaryChance = 35; rareChance = 40; 
    } else { 
      legendaryChance = 15; rareChance = 35; 
    }

    const extraHints = Math.max(0, hintsUsed - 5);
    const penaltyScore = extraHints + (mistakes * 2);

    legendaryChance = Math.max(2, legendaryChance - (penaltyScore * 5));
    rareChance = Math.max(10, rareChance - (penaltyScore * 4));

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
    if (!targetChar || isTimeUp || gameFinished || correctGuess) return;

    if (charName === targetChar.name) {
      setCorrectGuess(charName);
      setGameFinished(true);

      const newTotalHints = totalHintsUsed + revealedHintsCount;
      const newTotalMistakes = totalWrongGuesses + wrongAttempts;
      setTotalHintsUsed(newTotalHints);
      setTotalWrongGuesses(newTotalMistakes);

      setTimeout(() => {
        if (currentRound >= MAX_ROUNDS) {
           const wonReward = calculateFinalReward(newTotalHints, newTotalMistakes, difficulty);
           setReward(wonReward);
           setShowLevelCompleteModal(true);
        } else {
           setCurrentRound(prev => prev + 1);
           if (difficulty === 'larp') setTimeLeft(15);
           else if (difficulty === 'subaru') setTimeLeft(10);
           else if (difficulty === 'echidna') setTimeLeft(5);
           initializeRound(dbCharacters, usedChars, difficulty);
        }
      }, 700);

    } else {
      if (!guessedWrongOptions.includes(charName)) {
        setGuessedWrongOptions(prev => [...prev, charName]);
        setWrongAttempts(prev => prev + 1);
      }
    }
  };

  const handleShareClick = async () => {
    if (!reward) return;
    setIsSharing(true);
    const levelName = difficulty === 'larp' ? t.levelLarp : difficulty === 'subaru' ? t.levelSubaru : t.levelEchidna;
    const shareTitle = currentLanguage === 'en' ? "Tower Voices Guess Challenge" : "🏆 تحدي أصوات البرج 🏆";
    const winMsg = currentLanguage === 'en' ? "I beat the challenge and got card" : "أنهيت التحدي بنجاح وحصلت على بطاقة";
    const challengeMsg = currentLanguage === 'en' ? "Can you beat my record? Play here 👇" : "هل يمكنك تحطيم رقمي؟ جرب التحدي من هنا 👇";

    const shareText = `${shareTitle}\n${winMsg} (${currentLanguage === 'en' ? reward.nameEn : reward.name})! 🎉\n\n🛡️ ${levelName}\n💡 ${t.usedHints}: ${totalHintsUsed}\n🎯 ${t.wrongGuesses}: ${totalWrongGuesses}\n\n${challengeMsg}\nhttps://towervoices.online/activities/guess-character?lang=${currentLanguage}`;

    try {
      if (navigator.share) await navigator.share({ text: shareText });
      else {
        await navigator.clipboard.writeText(shareText);
        alert(currentLanguage === 'en' ? "✅ Copied to clipboard!" : "✅ تم نسخ النتيجة بنجاح!");
      }
    } catch (error) { console.log("Share cancelled", error); } 
    finally { setIsSharing(false); }
  };

  if (!isMounted || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

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

  return (
    <main dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col p-4 md:p-8 bg-[#0a0a0a] text-white relative">
      
      {/* Navbar مع زر اللغة */}
      <div className={`absolute top-4 ${currentLanguage === 'ar' ? 'left-4' : 'right-4'} z-[60]`}>
        <button 
            onClick={() => {
              const nextLang = currentLanguage === 'ar' ? 'en' : 'ar';
              setCurrentLanguage(nextLang);
              localStorage.setItem('siteLang', nextLang);
            }}
            className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-900/40 rounded-full px-3 py-1.5 hover:bg-emerald-900/60 transition-colors text-xs font-semibold backdrop-blur-md shadow-lg"
        >
            <span className="w-3.5 h-3.5 flex items-center justify-center">🌐</span>
            {t.langName}
        </button>
      </div>

      {showIntroModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-3xl p-6 md:p-10 w-full max-w-lg shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-300 my-8">
            <div className="text-center">
               <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🤔</div>
               <h2 className="text-2xl font-bold mb-2 text-white">{t.gameTitle}</h2>
               <p className="text-zinc-400 mb-6 text-sm">{t.subTitle}</p>
            </div>

            {introStep === 1 ? (
              <div className="animate-in fade-in duration-300">
                <div className="bg-black/40 rounded-2xl p-4 md:p-5 mb-6 md:mb-8 text-start space-y-4 md:space-y-5 text-sm md:text-base border border-zinc-800">
                  <h3 className="font-bold text-emerald-400 text-center mb-4 md:mb-5">{t.getCardsTitle}</h3>
                  <p className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">📈</span>
                    <span className="text-zinc-300 leading-relaxed"><b className="text-white">{t.rule1Title}</b> {t.rule1Desc}</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">📉</span>
                    <span className="text-zinc-300 leading-relaxed"><b className="text-white">{t.rule2Title}</b> {t.rule2Desc}</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🟢</span>
                    <span className="text-zinc-300 leading-relaxed"><b className="text-white">{t.rule3Title}</b> {t.rule3Desc}</span>
                  </p>
                </div>

                <button
                  onClick={() => setIntroStep(2)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 transition-all text-white py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
                >
                  {t.startGameBtn}
                </button>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="font-bold text-emerald-400 text-center mb-4">{t.selectLevel}</h3>
                <div className="flex flex-col gap-3">
                    <button onClick={() => startGame('larp')} className="bg-zinc-800/80 hover:bg-emerald-950/40 border border-zinc-700 hover:border-emerald-500 p-4 rounded-xl transition-all flex justify-between items-center group text-start">
                        <div>
                            <div className="font-bold text-white group-hover:text-emerald-400">{t.levelLarp}</div>
                            <div className="text-zinc-400 text-xs mt-1">{t.levelLarpDesc}</div>
                        </div>
                        <div className="text-2xl flex-shrink-0 ml-2">🟢</div>
                    </button>
                    
                    <button onClick={() => startGame('subaru')} className="bg-zinc-800/80 hover:bg-yellow-950/40 border border-zinc-700 hover:border-yellow-500 p-4 rounded-xl transition-all flex justify-between items-center group text-start">
                        <div>
                            <div className="font-bold text-white group-hover:text-yellow-400">{t.levelSubaru}</div>
                            <div className="text-zinc-400 text-xs mt-1">{t.levelSubaruDesc}</div>
                        </div>
                        <div className="text-2xl flex-shrink-0 ml-2">🟡</div>
                    </button>

                    <button onClick={() => startGame('echidna')} className="bg-zinc-800/80 hover:bg-red-950/40 border border-zinc-700 hover:border-red-500 p-4 rounded-xl transition-all flex justify-between items-center group text-start">
                        <div>
                            <div className="font-bold text-white group-hover:text-red-400">{t.levelEchidna}</div>
                            <div className="text-zinc-400 text-xs mt-1">{t.levelEchidnaDesc}</div>
                        </div>
                        <div className="text-2xl flex-shrink-0 ml-2">🔴</div>
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isTimeUp && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-red-500/50 rounded-3xl p-6 md:p-8 text-center w-full max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-300 my-8">
            <div className="text-4xl md:text-5xl mb-4 animate-bounce">⌛</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-red-500">{t.timeUp}</h2>
            <p className="text-sm md:text-base text-zinc-300 mb-2">{t.correctAnswerWas}</p>
            
            <div className="w-24 h-24 md:w-28 md:h-28 mx-auto my-3 md:my-4 rounded-full overflow-hidden border-4 border-zinc-800 shadow-lg bg-zinc-800/50 flex items-center justify-center">
                <img src={targetChar?.image} alt="character" className="w-full h-full object-contain p-2" />
            </div>
            
            <p className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">{currentLanguage === 'en' ? targetChar?.nameEn : targetChar?.name}</p>
            
            <div className="flex flex-col gap-2 md:gap-3">
               <button onClick={() => startGame(difficulty)} className="w-full bg-red-600 hover:bg-red-500 transition-colors text-white py-3 md:py-3.5 rounded-xl font-semibold text-sm md:text-base">
                 {t.tryAgain}
               </button>
               <button onClick={() => { setIntroStep(2); setShowIntroModal(true); setIsTimeUp(false); }} className="w-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors py-3 md:py-3.5 rounded-xl font-semibold text-zinc-300 text-sm md:text-base">
                 {t.changeLevel}
               </button>
            </div>
          </div>
        </div>
      )}

      {showLevelCompleteModal && reward && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-emerald-500/50 rounded-3xl p-6 md:p-8 text-center w-full max-w-md shadow-[0_0_60px_rgba(16,185,129,0.25)] animate-in zoom-in-95 duration-500 my-8">
            <div className="text-5xl md:text-6xl mb-3 md:mb-4 animate-bounce">🏆</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{t.levelCompleteTitle}</h2>
            <p className="text-sm md:text-base text-zinc-300 mb-4 md:mb-6">{t.levelCompleteDesc}</p>
            
            <div className="relative mx-auto w-36 md:w-48 flex justify-center items-center mb-4 md:mb-6">
              {reward.rarity === 'legendary' && <div className="absolute inset-0 bg-yellow-500 blur-[50px] opacity-40 rounded-full animate-pulse scale-110"></div>}
              {reward.rarity === 'rare' && <div className="absolute inset-0 bg-blue-500 blur-[50px] opacity-40 rounded-full animate-pulse scale-110"></div>}
              <img src={reward.image} alt="card" className="w-full h-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
            </div>
            
            <p className={`text-xl md:text-2xl font-bold ${reward.rarity === 'legendary' ? 'text-yellow-400' : reward.rarity === 'rare' ? 'text-blue-400' : 'text-white'}`}>
              {currentLanguage === 'en' ? reward.nameEn : reward.name}
            </p>
            <p className="text-[10px] md:text-xs mt-1 text-zinc-500 uppercase tracking-widest mb-4 md:mb-6">{t.rewardRarity}: {currentLanguage === 'en' ? reward.rarity.toUpperCase() : (reward.rarity === 'common' ? 'عادي' : reward.rarity === 'rare' ? 'نادر' : 'أسطوري')}</p>

            <div className="bg-black/40 p-3 md:p-4 rounded-xl space-y-2 md:space-y-3 text-sm text-zinc-300 text-start border border-zinc-800 mb-4 md:mb-6">
              <p className="flex justify-between"><span>💡 {t.totalHints}:</span> <span className="font-bold text-white">{totalHintsUsed}</span></p>
              <p className="flex justify-between"><span>🎯 {t.totalErrors}:</span> <span className="font-bold text-white">{totalWrongGuesses}</span></p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
               <button onClick={handleShareClick} disabled={isSharing} className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors text-white py-3 md:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm md:text-base">
                 {t.share}
               </button>
               <button onClick={() => { setIntroStep(2); setShowIntroModal(true); setShowLevelCompleteModal(false); }} className="w-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors py-3 md:py-3.5 rounded-xl font-semibold text-zinc-300 block text-sm md:text-base">
                 {t.changeLevel}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 هنا التعديل السحري: جعلنا الشريط العلوي Sticky */}
      {!showIntroModal && (
        <div className="sticky top-0 z-[40] pt-14 pb-2 bg-[#0a0a0a]/90 backdrop-blur-md w-full max-w-4xl mx-auto border-b border-zinc-800/50 mb-6">
          <div className="flex flex-wrap justify-between items-center bg-zinc-900/80 p-3 md:p-4 rounded-2xl border border-zinc-800 gap-2 md:gap-4 shadow-md">
             <div className="flex items-center gap-2 md:gap-3">
                <span className="bg-emerald-950/40 text-emerald-400 font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-emerald-900/50 text-[10px] md:text-sm">
                  {t.round} {currentRound} {t.of} {MAX_ROUNDS}
                </span>
                <button onClick={() => { setIntroStep(2); setShowIntroModal(true); }} className="bg-zinc-800 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-zinc-700 text-[10px] md:text-xs hover:bg-zinc-700 transition-colors">
                  ⚙️
                </button>
             </div>
             
             <div className="flex gap-2 md:gap-3 text-[10px] md:text-sm font-semibold">
                <span className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${timeLeft <= 3 ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse' : 'bg-zinc-800 border-zinc-700'}`}>
                  ⏱️ {timeLeft} {t.seconds}
                </span>
                <span className="bg-zinc-800 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-zinc-700">💡 {revealedHintsCount}</span>
                <span className="bg-zinc-800 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-zinc-700">🎯 {wrongAttempts}</span>
             </div>
          </div>
        </div>
      )}

      {/* واجهة اللعب الأساسية */}
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 pb-8">
        <div className="flex-1 flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
          {currentHintsList.slice(0, revealedHintsCount).map((hint, index) => (
            <div key={index} className="bg-zinc-800/80 border border-zinc-700 p-4 md:p-5 rounded-2xl shadow-lg animate-in slide-in-from-bottom-4">
              <div className="text-emerald-500 text-xs md:text-sm font-bold mb-1.5 md:mb-2">{t.hintNumber} {index + 1}</div>
              <p className="text-base md:text-xl text-zinc-200 leading-relaxed">{hint}</p>
            </div>
          ))}
          
          {revealedHintsCount < currentHintsList.length && difficulty !== 'echidna' ? (
            <button 
              onClick={handleRevealHint}
              className="self-center mt-2 md:mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 md:px-6 py-2.5 md:py-3 rounded-xl border border-zinc-600 transition-all text-sm md:text-base font-semibold"
            >
              {t.showNextHint}
            </button>
          ) : (
            <div className="self-center mt-2 md:mt-4 font-bold">
              {difficulty === 'echidna' ? (
                <span className="text-red-400 bg-red-950/30 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-red-900/50 text-xs md:text-sm">⚠️ {t.echidnaConstraint}</span>
              ) : (
                <span className="text-zinc-500 text-xs md:text-sm">{t.noMoreHints}</span>
              )}
            </div>
          )}
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-5 md:p-6 rounded-3xl mt-auto">
          <h3 className="text-center font-bold text-zinc-400 mb-4 md:mb-6 text-sm md:text-base">{t.selectAnswer}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {options.map((option) => {
              const isWrong = guessedWrongOptions.includes(option.name);
              const isCorrect = correctGuess === option.name;
              const charDisplayName = currentLanguage === 'en' && option.nameEn ? option.nameEn : option.name;

              return (
                <button
                  key={option.name}
                  onClick={() => handleGuess(option.name)}
                  disabled={isWrong || isTimeUp || gameFinished || correctGuess !== null}
                  className={`
                    p-3.5 md:p-4 rounded-xl border-2 transition-all font-bold text-base md:text-lg flex items-center justify-between
                    ${isCorrect ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[1.02]' 
                     : isWrong ? 'bg-red-950/20 border-red-900/50 text-red-500/50 cursor-not-allowed line-through' 
                     : 'bg-zinc-800 border-zinc-700 hover:border-emerald-500 hover:bg-emerald-950/30 text-white active:scale-95'}
                  `}
                >
                  {charDisplayName}
                  {isCorrect && <span>✅</span>}
                  {isWrong && <span>❌</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}