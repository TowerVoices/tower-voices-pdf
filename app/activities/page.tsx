import Link from "next/link";

export default function ActivitiesPage() {
  const activities = [
    {
      id: "match-character",
      title: "طابق الشخصية",
      description: "اختبر ذاكرتك في مطابقة الشخصيات مع معلوماتها",
      icon: "🎴",
      link: "/activities/match-character",
      color: "from-indigo-600 to-purple-600",
      isComingSoon: false
    },
    {
      id: "guess-character",
      title: "خمن الشخصية",
      description: "هل يمكنك معرفة الشخصية من خلال التلميحات؟",
      icon: "🤔",
      link: "#",
      color: "from-emerald-600 to-teal-600",
      isComingSoon: true
    },
    {
      id: "quiz",
      title: "اختبار المعرفة",
      description: "أجب عن الأسئلة واكتشف مدى معرفتك بالقصة",
      icon: "📜",
      link: "#",
      color: "from-orange-600 to-red-600",
      isComingSoon: true
    }
  ];

  return (
    <main className="min-h-screen p-8 bg-[radial-gradient(circle_at_top,#18181b_0%,#000_100%)] text-white flex flex-col items-center justify-center">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400">
          مركز الفعاليات
        </h1>
        <p className="text-zinc-400 text-lg">اختر التحدي الذي يناسبك واجمع المكافآت</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {activities.map((activity) => {
          // تصميم البطاقة المشترك
          const CardContent = (
            <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 h-full flex flex-col relative overflow-hidden
              ${activity.isComingSoon 
                ? 'opacity-60 cursor-not-allowed grayscale-[40%]' // تصميم الباهت للبطاقات غير الجاهزة
                : 'hover:border-zinc-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer' // تصميم البطاقة الفعالة
              }`}
            >
              
              {/* شارة "قريباً" الزاوية العلوية */}
              {activity.isComingSoon && (
                <div className="absolute top-4 left-4 bg-zinc-800 text-xs font-bold px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300">
                  قريباً ⏳
                </div>
              )}

              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4 bg-gradient-to-br ${activity.color}`}>
                {activity.icon}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">{activity.title}</h2>
              <p className="text-zinc-400 flex-1">{activity.description}</p>
              
              <div className={`mt-6 flex items-center text-sm font-semibold 
                ${activity.isComingSoon ? 'text-zinc-500' : 'text-zinc-300 group-hover:text-white'}`}
              >
                {activity.isComingSoon ? (
                  'يتم التجهيز...'
                ) : (
                  <>ابدأ التحدي <span className="ml-2">←</span></>
                )}
              </div>

            </div>
          );

          // إذا كانت اللعبة "قريباً" نضعها في div عادي بدون رابط، وإلا نضعها داخل Link
          return activity.isComingSoon ? (
            <div key={activity.id}>{CardContent}</div>
          ) : (
            <Link href={activity.link} key={activity.id} className="group">
              {CardContent}
            </Link>
          );
        })}
      </div>

    </main>
  );
}