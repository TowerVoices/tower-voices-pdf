import React from "react"; // إضافة هذا السطر ضرورية جداً لإصلاح خطأ TypeScript ومنع فشل البناء
import { Metadata } from "next";

// هذا الكود يضمن الأرشفة الصحيحة ويحل مشكلة "الوصف المكرر"
export const metadata: Metadata = {
  title: "خريطة البرج: التسلسل الزمني لرواية ري زيرو",
  description: "اكتشف الترتيب الصحيح لقراءة مجلدات وأركات ري زيرو. خريطة البرج توفر لك تسلسلاً زمنياً دقيقاً للقصص الجانبية ومجلدات EX المترجمة حصرياً.",
  keywords: ["ترتيب قراءة ري زيرو", "تسلسل ري زيرو الزمني", "أصوات البرج"],
  openGraph: {
    title: "خريطة البرج: دليلك الشامل لترتيب أحداث ري زيرو",
    description: "لا تضع في عالم ري زيرو المعقد! اتبع خريطة البرج لمعرفة مسار الأحداث الزمني والترتيب المثالي للقراءة.",
    url: "https://towervoices.online/timeline",
    type: "website",
  },
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}