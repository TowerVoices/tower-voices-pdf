import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الفعاليات والألعاب | أصوات البرج',
  description: 'استعد ذكرياتك واختبر معرفتك بعالم ري زيرو من خلال مجموعة من الألعاب والتحديات الممتعة.',
};

export default function ActivitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}