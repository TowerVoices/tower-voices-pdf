import { headers } from 'next/headers';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  // ✨ أضفنا كلمة await هنا لحل المشكلة
  const headersList = await headers(); 
  const lang = headersList.get('x-user-lang');

  if (lang === 'en') {
    return {
      title: 'Activities & Games | Tower Voices',
      description: 'Reclaim your memories and test your Re:Zero knowledge!',
      openGraph: {
        title: 'Activities & Games | Tower Voices',
        description: 'Test your Re:Zero knowledge, guess characters, and collect legendary cards!',
        siteName: 'Tower Voices',
        locale: 'en_US',
        type: 'website',
      },
    };
  }

  return {
    title: 'الفعاليات والألعاب | أصوات البرج',
    description: 'استعد ذكرياتك واختبر معرفتك بعالم ري زيرو من خلال مجموعة من الألعاب والتحديات الممتعة.',
    openGraph: {
      title: 'الفعاليات والألعاب | أصوات البرج',
      description: 'استعد ذكرياتك واختبر معرفتك بعالم ري زيرو من خلال مجموعة من الألعاب والتحديات الممتعة.',
      siteName: 'أصوات البرج',
      locale: 'ar_AR',
      type: 'website',
    },
  };
}

export default function ActivitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}