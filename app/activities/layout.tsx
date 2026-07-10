import { Metadata } from 'next';

export const metadata: Metadata = {
  // عنوان يجمع بين الإنجليزية والعربية ليناسب الجميع
  title: 'Activities & Games |  Tower Voices',
  
  // وصف باللغتين يوضح فكرة الفعاليات
  description: 'Reclaim your memories and test your Re:Zero knowledge! ',
  
  // (OpenGraph) هذه الإعدادات مخصصة لظهور الرابط بشكل أنيق في ديسكورد، تويتر، وواتساب
  openGraph: {
    title: 'Activities & Games | Tower Voices',
    description: 'Test your Re:Zero knowledge, guess characters, and collect legendary cards!',
    siteName: 'Tower Voices ',
    locale: 'en_US',
    alternateLocale: 'ar_AR',
    type: 'website',
  },
};

export default function ActivitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
