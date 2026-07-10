import { Metadata } from 'next';

export const metadata: Metadata = {
  // عنوان يجمع بين الإنجليزية والعربية ليناسب الجميع (يظهر في المتصفح وجوجل)
  title: 'Activities & Games | الفعاليات والألعاب - Tower Voices',
  
  // وصف باللغتين يوضح فكرة الفعاليات (يظهر في المتصفح وجوجل)
  description: 'Reclaim your memories and test your Re:Zero knowledge! | استعد ذكرياتك واختبر معرفتك بعالم ري زيرو من خلال التحديات الممتعة.',
  
  // 🔥 (OpenGraph) الإعدادات التي يقرأها ديسكورد (جعلناها إنجليزية بالكامل)
  openGraph: {
    title: 'Activities & Games | Tower Voices',
    description: 'Test your Re:Zero knowledge, guess characters, and collect legendary cards!',
    siteName: 'Tower Voices', // ✨ تم حذف الكلمة العربية من هنا
    locale: 'en_US',
    type: 'website',
  },
};

export default function ActivitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}