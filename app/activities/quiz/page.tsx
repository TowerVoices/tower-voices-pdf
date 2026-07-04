"use client";

import { useState, useEffect, useRef } from "react";
import { client } from "@/app/sanity.client"; 
import Link from "next/link";

interface QuizQuestion {
  _id: string;
  question: string;
  questionEn: string;
  questionImage?: string;
  options: string[];
  optionsEn: string[];
  correctAnswerIndex: number;
  isNovelSpoiler?: boolean; 
}

interface RewardFromSanity {
  name: string;
  nameEn: string;
  image: string;
  rarity: string;
}

const uiTexts = {
  ar: {
    gameTitle: "اختبار المعرفة",
    subTitle: "أجب عن الأسئلة واكتشف مدى معرفتك بقصة وعالم ري زيرو.",
    preparing: "جاري تجهيز التحدي...",
    winTitle: "🎉 اختبار مكتمل!",
    gotCard: "حصلت على بطاقة جديدة استناداً لإجاباتك الصحيحة.",
    rewardRarity: "الندرة",
    share: "📤 مشاركة النتيجة",
    langName: "English",
    getCardsTitle: "كيف تحصل على البطاقات؟ 🃏",
    rule1Title: "مستوى الصعوبة:",
    rule1Desc: "إيكيدنا تمنحك فرصة ضخمة للأسطوري، ولكن لا مجال للخطأ!",
    rule2Title: "الإجابات الصحيحة:",
    rule2Desc: "كلما زادت إجاباتك الصحيحة من أصل 10، زادت فرصة البطاقة النادرة.",
    rule3Title: "العودة بالموت:",
    rule3Desc: "يعيدك بالزمن! الموتة الأولى ترجعك سؤال، الثانية سؤالين، والثالثة ستعيدك لـنقطة البداية 💀",
    score: "الإجابات الصحيحة",
    lives: "الأرواح",
    notEnoughData: "عذراً، يجب إضافة 10 أسئلة على الأقل في لوحة Sanity للبدء.",
    startGameBtn: "فهمت، لنبدأ 🚀",
    selectLevel: "اختر مستوى الصعوبة:",
    levelLarp: "لارب (Larp)",
    levelLarpDesc: "15 ثانية للسؤال، لديك 3 أرواح.",
    levelSubaru: "سوبارو (Subaru)",
    levelSubaruDesc: "10 ثواني للسؤال، لديك روحان (2).",
    levelEchidna: "إيكيدنا (Echidna)",
    levelEchidnaDesc: "5 ثواني للسؤال، لديك روح 1 (الخطأ يعيدك للبداية!).",
    levelNovel: "مكتبة تايجيتا (Taygeta)", 
    levelNovelDesc: "10 ثوانٍ للسؤال. ⚠️ تحذير شديد: حرق للأحداث المتقدمة!",
    timeUp: "انتهى الوقت!",
    correctAnswerWas: "الإجابة الصحيحة كانت:",
    changeLevel: "تغيير المستوى",
    seconds: "ثانية",
    questionNum: "السؤال",
    of: "من",
    gameOverTitle: "💀 لقد خسرت!",
    gameOverDesc: "استنفدت جميع أرواحك... وحش اللارب التهمك!",
    restartGame: "العب من جديد",
    returnByDeath: "العودة بالموت...",
    backToActivities: "العودة للفعاليات 🏠"
  },
  en: {
    gameTitle: "Knowledge Quiz",
    subTitle: "Answer the questions to test your knowledge of Re:Zero.",
    preparing: "Preparing Challenge...",
    winTitle: "🎉 Quiz Completed!",
    gotCard: "You obtained a new card based on your correct answers.",
    rewardRarity: "Rarity",
    share: "📤 Share Result",
    langName: "العربية",
    getCardsTitle: "How to get Cards? 🃏",
    rule1Title: "Difficulty Level:",
    rule1Desc: "Echidna gives a huge chance for Legendary, but no mistakes allowed!",
    rule2Title: "Correct Answers:",
    rule2Desc: "The more correct answers out of 10, the better the card.",
    rule3Title: "Return by Death:",
    rule3Desc: "Rewinds time! 1st death = back 1 Q, 2nd = back 2 Qs, 3rd = restart from save point 💀",
    score: "Correct Answers",
    lives: "Lives",
    notEnoughData: "Sorry, you need at least 10 questions in Sanity to start.",
    startGameBtn: "Got it, Let's go! 🚀",
    selectLevel: "Select Difficulty:",
    levelLarp: "Larp",
    levelLarpDesc: "15s per question, 3 Lives.",
    levelSubaru: "Subaru",
    levelSubaruDesc: "10s per question, 2 Lives.",
    levelEchidna: "Echidna",
    levelEchidnaDesc: "5s per question, 1 Life (Mistake = Restart!).",
    levelNovel: "Taygeta Library", 
    levelNovelDesc: "10s per question. ⚠️ Extreme Warning: Spoilers ahead!",
    timeUp: "Time's Up!",
    correctAnswerWas: "The correct answer was:",
    changeLevel: "Change Level",
    seconds: "s",
    questionNum: "Question",
    of: "of",
    gameOverTitle: "💀 Game Over!",
    gameOverDesc: "You ran out of lives... The Larp Monster consumed you!",
    restartGame: "Play Again",
    returnByDeath: "Return by Death...",
    backToActivities: "Back to Activities 🏠"
  }
};

type Difficulty = 'larp' | 'subaru' | 'echidna' | 'novel' | null;
const TOTAL_QUESTIONS = 10;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const playSound = (audioPath: string) => {
  if (typeof window !== "undefined") {
    const audio = new Audio(audioPath);
    if (audioPath.includes("larp-monster")) audio.volume = 0.8;
    else audio.volume = 1.0;
    
    audio.play().catch(err => console.log("Audio play blocked by browser:", err));
  }
};

export default function QuizPage() {
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>('ar');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      const savedLang = localStorage.getItem('siteLang');
      let targetLang: 'ar' | 'en' = 'ar';

      if (urlLang === 'en' || urlLang === 'ar') {
        targetLang = urlLang;
        localStorage.setItem('siteLang', urlLang);
      } else if (savedLang === 'en' || savedLang === 'ar') {
        targetLang = savedLang;
      }
      setCurrentLanguage(targetLang);
      setIsMounted(true);
    }
  }, []);

  const t = uiTexts[currentLanguage];

  const [dbQuestions, setDbQuestions] = useState<QuizQuestion[]>([]);
  const [dbRewards, setDbRewards] = useState<RewardFromSanity[]>([]);
  const [larpMonsterImage, setLarpMonsterImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Game States
  const [difficulty, setDifficulty] = useState<Difficulty>(null);
  const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lives, setLives] = useState(0);
  const [score, setScore] = useState(0);
  const [deathsCount, setDeathsCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Effects & Modals
  const [isDying, setIsDying] = useState(false); 
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [introStep, setIntroStep] = useState<1 | 2>(1);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [reward, setReward] = useState<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchSanityData = async () => {
      try {
        const quizQuery = `*[_type == "activityQuiz"]{
          _id, question, questionEn, "questionImage": questionImage.asset->url, options, optionsEn, correctAnswerIndex, isNovelSpoiler
        }`;
        const rewardQuery = `*[_type == "activityReward"]{name, nameEn, "image": image.asset->url, rarity}`;
        const settingsQuery = `*[_type == "gameSettings"][0]{"larpMonsterImage": larpMonsterImage.asset->url}`;

        const [questionsData, rewardData, settingsData] = await Promise.all([
          client.fetch(quizQuery),
          client.fetch(rewardQuery),
          client.fetch(settingsQuery)
        ]);

        setDbQuestions(questionsData);
        setDbRewards(rewardData);
        if (settingsData?.larpMonsterImage) setLarpMonsterImage(settingsData.larpMonsterImage);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchSanityData();
  }, []);

  const startGame = (selectedLevel: Difficulty) => {
    const isNovelMode = selectedLevel === 'novel';
    const filteredDB = dbQuestions.filter(q => isNovelMode ? q.isNovelSpoiler : !q.isNovelSpoiler);

    if (filteredDB.length < TOTAL_QUESTIONS) {
      alert(currentLanguage === 'ar' 
        ? `عذراً! لا يوجد عدد كافٍ من الأسئلة لهذا المسار. المتوفر: ${filteredDB.length} والمطلوب: 10.` 
        : `Not enough questions for this path! Available: ${filteredDB.length}, Needed: 10.`);
      return;
    }

    setDifficulty(selectedLevel);
    const shuffled = shuffleArray(filteredDB).slice(0, TOTAL_QUESTIONS);
    
    const randomizedQuestions = shuffled.map(q => {
      const optsLen = q.options?.length || 4;
      const baseIndices = Array.from({ length: optsLen }, (_, i) => i);
      const shuffledIndices = shuffleArray(baseIndices);
      
      const newCorrectIndex = shuffledIndices.indexOf(q.correctAnswerIndex);
      
      return { ...q, shuffledIndices, newCorrectIndex };
    });

    setActiveQuestions(randomizedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setDeathsCount(0);
    setSelectedOption(null);
    
    if (selectedLevel === 'larp') { setLives(3); setTimeLeft(15); }
    else if (selectedLevel === 'subaru') { setLives(2); setTimeLeft(10); } 
    else if (selectedLevel === 'echidna') { setLives(1); setTimeLeft(5); } 
    else if (selectedLevel === 'novel') { setLives(2); setTimeLeft(10); } 

    setShowIntroModal(false);
    setShowGameOverModal(false);
    setShowWinModal(false);
    setIsDying(false);
    setIsTransitioning(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null); 
      if (difficulty === 'larp') setTimeLeft(15);
      else if (difficulty === 'subaru') setTimeLeft(10);
      else if (difficulty === 'echidna') setTimeLeft(5);
      else if (difficulty === 'novel') setTimeLeft(10);
      setIsTransitioning(false);
    } else {
      finishGame(score);
    }
  };

  const processDeath = () => {
    if (isTransitioning && selectedOption === null) return; 
    setIsTransitioning(true);
    
    const nextDeaths = deathsCount + 1;
    setDeathsCount(nextDeaths);
    
    if (lives > 0) {
      if (difficulty === 'echidna' || nextDeaths >= 3) {
        playSound('/sounds/return-by-death.mp3'); 
      } else {
        playSound('/sounds/return-by-death-short.mp3'); 
      }
      
      setIsDying(true);
      
      setTimeout(() => {
        setLives(prev => prev - 1);
        setIsDying(false);
        
        let rewindAmount = 0;
        if (difficulty === 'echidna') {
          rewindAmount = currentQuestionIndex; 
        } else {
          if (nextDeaths === 1) rewindAmount = 1;
          else if (nextDeaths === 2) rewindAmount = 2;
          else if (nextDeaths >= 3) rewindAmount = currentQuestionIndex; 
        }

        setCurrentQuestionIndex(prev => {
          const newIndex = Math.max(0, prev - rewindAmount);
          setScore(newIndex); 
          return newIndex;
        });

        setSelectedOption(null); 
        
        if (difficulty === 'larp') setTimeLeft(15);
        else if (difficulty === 'subaru') setTimeLeft(10);
        else if (difficulty === 'echidna') setTimeLeft(5);
        else if (difficulty === 'novel') setTimeLeft(10);

        setIsTransitioning(false);
      }, 2800); 
    } else {
      playSound('/sounds/larp-monster.mp3'); 
      setShowGameOverModal(true);
      setIsTransitioning(false);
    }
  };

  const handleAnswer = (selectedIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedOption(selectedIndex); 

    const currentQ = activeQuestions[currentQuestionIndex];
    
    if (selectedIndex === currentQ.newCorrectIndex) {
      setScore(prev => prev + 1);
      setTimeout(() => {
        handleNextQuestion();
      }, 800);
    } else {
      setTimeout(() => {
        processDeath();
      }, 500); 
    }
  };

  useEffect(() => {
    if (showIntroModal || showGameOverModal || showWinModal || isTransitioning || isLoading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          processDeath(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showIntroModal, showGameOverModal, showWinModal, isTransitioning, isLoading, lives]);

  const finishGame = (finalScore: number) => {
    let legendaryChance = 0; let rareChance = 0;

    if (difficulty === 'echidna') { legendaryChance = 70; rareChance = 30; } 
    else if (difficulty === 'novel') { legendaryChance = 50; rareChance = 40; } 
    else if (difficulty === 'subaru') { legendaryChance = 25; rareChance = 50; }
    else { legendaryChance = 10; rareChance = 30; }

    const mistakes = TOTAL_QUESTIONS - finalScore;
    legendaryChance = Math.max(0, legendaryChance - (mistakes * 10));
    rareChance = Math.max(10, rareChance - (mistakes * 5));

    const roll = Math.random() * 100;
    let targetRarity = 'common';
    if (roll <= legendaryChance) targetRarity = 'legendary'; 
    else if (roll <= legendaryChance + rareChance) targetRarity = 'rare'; 
    
    const filteredRewards = dbRewards.filter(r => r.rarity === targetRarity);
    const pool = filteredRewards.length > 0 ? filteredRewards : dbRewards;
    const wonCard = pool[Math.floor(Math.random() * pool.length)];

    setReward(wonCard);
    setShowWinModal(true);
  };

  const handleShareClick = async () => {
    if (!reward) return;
    setIsSharing(true);
    const levelName = difficulty === 'larp' ? t.levelLarp : difficulty === 'subaru' ? t.levelSubaru : difficulty === 'echidna' ? t.levelEchidna : t.levelNovel;
    const shareText = `${currentLanguage === 'en' ? "Knowledge Quiz" : "اختبار المعرفة"}\n🎉 ${currentLanguage === 'en' ? reward.nameEn : reward.name}!\n\n🛡️ ${levelName}\n✅ ${t.score}: ${score}/${TOTAL_QUESTIONS}\n❤️ ${t.lives}: ${lives}\n\nhttps://towervoices.online/activities/quiz?lang=${currentLanguage}`;

    try {
      if (navigator.share) await navigator.share({ text: shareText });
      else {
        await navigator.clipboard.writeText(shareText);
        alert(currentLanguage === 'en' ? "✅ Copied!" : "✅ تم النسخ!");
      }
    } catch (error) {} 
    finally { setIsSharing(false); }
  };

  if (!isMounted || isLoading) return <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></main>;

  const currentQ = activeQuestions[currentQuestionIndex];

  return (
    <main dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'} className="h-[100dvh] w-full flex flex-col bg-[#0a0a0a] text-white relative overflow-hidden">
      
      {/* تأثير العودة بالموت */}
      {isDying && (
        <div className="fixed inset-0 z-[200] pointer-events-none animate-pulse flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,0,0,0.85)_0%,rgba(0,0,0,1)_80%)]"></div>
            <h1 
               className="text-6xl md:text-8xl lg:text-9xl font-black text-black relative z-10 glitch-text tracking-widest text-center px-4"
               style={{ 
                 textShadow: "0 0 15px #a855f7, 0 0 30px #d946ef, 0 0 50px #9333ea, 0 0 80px #c026d3",
                 WebkitTextStroke: "2px #c026d3" 
               }}
            >
                {t.returnByDeath}
            </h1>
        </div>
      )}

      {/* زر اللغة */}
      <div className={`absolute top-4 md:top-6 ${currentLanguage === 'ar' ? 'left-4 md:left-8' : 'right-4 md:right-8'} z-[60]`}>
        <button 
            onClick={() => {
              const nextLang = currentLanguage === 'ar' ? 'en' : 'ar';
              setCurrentLanguage(nextLang);
              localStorage.setItem('siteLang', nextLang);
            }}
            className="flex items-center gap-2 border border-orange-500/30 bg-orange-900/40 rounded-full px-3 py-1.5 md:px-4 md:py-2 hover:bg-orange-900/60 transition-colors text-xs md:text-sm font-semibold backdrop-blur-md shadow-lg"
        >
            <span className="w-4 h-4 text-[10px] md:text-xs flex items-center justify-center">🌐</span>
            {t.langName}
        </button>
      </div>

      {showGameOverModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,0,0,0.85)_0%,rgba(0,0,0,1)_80%)] backdrop-blur-md"></div>
          
          <div className="bg-zinc-950 border-2 border-red-600 rounded-3xl p-6 md:p-8 text-center w-full max-w-md shadow-[0_0_100px_rgba(220,38,38,0.5)] animate-in zoom-in-75 duration-700 my-8 relative z-10">
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

            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => { setIntroStep(2); setShowIntroModal(true); setShowGameOverModal(false); }} 
                className="w-full bg-red-700 hover:bg-red-600 transition-colors text-white py-4 rounded-xl font-bold text-lg md:text-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95"
              >
                {t.restartGame} 🔄
              </button>
              <Link 
                href="/activities" 
                className="w-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors py-3 md:py-3.5 rounded-xl font-semibold text-zinc-300 block text-sm md:text-base text-center"
              >
                {t.backToActivities}
              </Link>
            </div>
          </div>
        </div>
      )}

      {showIntroModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-3xl p-6 md:p-10 w-full max-w-lg shadow-[0_0_50px_rgba(249,115,22,0.15)] animate-in zoom-in-95 duration-300 my-8">
            <div className="text-center">
               <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📜</div>
               <h2 className="text-2xl font-bold mb-2 text-white">{t.gameTitle}</h2>
               <p className="text-zinc-400 mb-6 text-sm">{t.subTitle}</p>
            </div>

            {introStep === 1 ? (
              <div className="animate-in fade-in duration-300">
                <div className="bg-black/40 rounded-2xl p-4 md:p-5 mb-6 md:mb-8 text-start space-y-4 md:space-y-5 text-sm md:text-base border border-zinc-800">
                  <h3 className="font-bold text-orange-400 text-center mb-4 md:mb-5">{t.getCardsTitle}</h3>
                  <p className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">📈</span>
                    <span className="text-zinc-300 leading-relaxed"><b className="text-white">{t.rule1Title}</b> {t.rule1Desc}</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🟢</span>
                    <span className="text-zinc-300 leading-relaxed"><b className="text-white">{t.rule2Title}</b> {t.rule2Desc}</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">💀</span>
                    <span className="text-zinc-300 leading-relaxed"><b className="text-white">{t.rule3Title}</b> {t.rule3Desc}</span>
                  </p>
                </div>

                <button
                  onClick={() => setIntroStep(2)}
                  className="w-full bg-orange-600 hover:bg-orange-500 transition-all text-white py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-orange-500/25 active:scale-[0.98]"
                >
                  {t.startGameBtn}
                </button>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="font-bold text-orange-400 text-center mb-4">{t.selectLevel}</h3>
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

                    <button onClick={() => startGame('novel')} className="bg-zinc-800/80 hover:bg-purple-950/40 border border-zinc-700 hover:border-purple-500 p-4 rounded-xl transition-all flex justify-between items-center group text-start relative overflow-hidden">
                        <div className={`absolute top-0 ${currentLanguage === 'ar' ? 'left-0 rounded-br-lg' : 'right-0 rounded-bl-lg'} bg-red-600 text-white text-[10px] font-bold px-2 py-0.5`}>
                           {currentLanguage === 'en' ? 'SPOILER ⚠️' : 'حرق ⚠️'}
                        </div>
                        <div>
                            <div className="font-bold text-white group-hover:text-purple-400">{t.levelNovel}</div>
                            <div className="text-red-400 font-bold text-xs mt-1">{t.levelNovelDesc}</div>
                        </div>
                        <div className="text-2xl flex-shrink-0 ml-2">📖</div>
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showWinModal && reward && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-orange-500/50 rounded-3xl p-6 md:p-8 text-center w-full max-w-md shadow-[0_0_60px_rgba(249,115,22,0.25)] animate-in zoom-in-95 duration-500 my-8">
            <div className="text-5xl md:text-6xl mb-3 md:mb-4 animate-bounce">🏆</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">{t.winTitle}</h2>
            <p className="text-sm md:text-base text-zinc-300 mb-4 md:mb-6">{t.gotCard}</p>
            
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
              <p className="flex justify-between"><span>✅ {t.score}:</span> <span className="font-bold text-white">{score} / {TOTAL_QUESTIONS}</span></p>
              <p className="flex justify-between"><span>❤️ {t.lives}:</span> <span className="font-bold text-white">{lives}</span></p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
               <button onClick={handleShareClick} disabled={isSharing} className="w-full bg-orange-600 hover:bg-orange-500 transition-colors text-white py-3 md:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm md:text-base">
                 {t.share}
               </button>
               <button onClick={() => { setIntroStep(2); setShowIntroModal(true); setShowWinModal(false); }} className="w-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors py-3 md:py-3.5 rounded-xl font-semibold text-zinc-300 block text-sm md:text-base">
                 {t.changeLevel}
               </button>
               <Link 
                 href="/activities" 
                 className="w-full bg-black/40 hover:bg-black/60 border border-transparent hover:border-zinc-800 transition-colors py-3 rounded-xl font-semibold text-sm md:text-base text-zinc-400 block mt-1 text-center"
               >
                 {t.backToActivities}
               </Link>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 حاوية اللعب الأساسية المجمّعة في المركز */}
      {!showIntroModal && !showGameOverModal && !showWinModal && currentQ && (
        <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 h-full px-4 md:px-6 pt-16 pb-6 relative">
          
          {/* الشريط العلوي الثابت للعبة */}
          <div className="flex-shrink-0 w-full mb-6 md:mb-8">
            <div className="flex flex-wrap justify-between items-center bg-zinc-900/80 p-3 md:p-4 rounded-2xl border border-zinc-800 gap-2 md:gap-4 shadow-md">
               <div className="flex items-center gap-2 md:gap-3">
                  <span className="bg-orange-950/40 text-orange-400 font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-orange-900/50 text-[10px] md:text-sm">
                    {t.questionNum} {currentQuestionIndex + 1} {t.of} {TOTAL_QUESTIONS}
                  </span>
               </div>
               
               <div className="flex gap-2 md:gap-3 text-[10px] md:text-sm font-semibold">
                  <span className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${timeLeft <= 3 ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse' : 'bg-zinc-800 border-zinc-700'}`}>
                    ⏱️ {timeLeft} {t.seconds}
                  </span>
                  <span className="bg-zinc-800 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-zinc-700">✅ {score}</span>
                  <span className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border flex items-center gap-1 ${lives === 0 ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-zinc-800 border-zinc-700'}`}>❤️ {lives}</span>
               </div>
            </div>
          </div>

          {/* 🔥 محاذاة تبدأ من الأعلى (justify-start) لجميع الأجهزة لمنع دفع المكونات للأسفل */}
          <div className="flex-1 flex flex-col justify-start gap-4 md:gap-8 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-4 md:pt-4">
              
              {/* صندوق السؤال */}
              <div className="w-full bg-zinc-800/80 border border-zinc-700 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-lg text-center animate-in zoom-in-95 flex-shrink-0">
                {currentQ.questionImage && (
                  <div className="mb-4 flex justify-center">
                    <img 
                       src={currentQ.questionImage} 
                       alt="Question" 
                       className="max-h-32 md:max-h-56 w-auto object-contain rounded-xl border-2 border-zinc-700 shadow-md" 
                    />
                  </div>
                )}
                <h3 className="text-lg md:text-2xl font-bold text-white leading-relaxed">
                    {currentLanguage === 'en' ? currentQ.questionEn : currentQ.question}
                </h3>
              </div>

              {/* صندوق الخيارات */}
              <div className="w-full bg-zinc-900/80 border border-zinc-800 p-4 md:p-6 rounded-2xl md:rounded-3xl flex-shrink-0">
                <div className={`grid gap-2 md:gap-4 ${
                    currentQ.shuffledIndices.length === 2 
                      ? 'grid-cols-1 sm:grid-cols-2' 
                      : 'grid-cols-1 sm:grid-cols-2'
                  }`}
                >
                  {currentQ.shuffledIndices.map((originalIdx: number, idx: number) => {
                    const optsArray = currentLanguage === 'en' && currentQ.optionsEn && currentQ.optionsEn.length > 0 
                      ? currentQ.optionsEn 
                      : currentQ.options;
                    
                    const optText = optsArray[originalIdx];

                    let btnStyle = "p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all font-bold text-sm md:text-lg text-white text-center flex justify-center items-center gap-2 leading-snug ";

                    if (selectedOption !== null) {
                      if (idx === selectedOption) {
                        btnStyle += idx === currentQ.newCorrectIndex 
                          ? "bg-orange-500 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.6)] scale-[1.02] " 
                          : "bg-red-900/80 border-red-500 opacity-70 "; 
                      } else {
                        btnStyle += "bg-zinc-800 border-zinc-700 opacity-50 ";
                      }
                    } else {
                      btnStyle += "border-zinc-700 bg-zinc-800 hover:border-orange-500 hover:bg-orange-950/30 active:scale-95 ";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={isTransitioning}
                        className={btnStyle}
                      >
                        {optText}
                      </button>
                    );
                  })}
                </div>
              </div>
          </div>
        </div>
      )}
    </main>
  );
}