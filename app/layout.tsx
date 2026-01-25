import type { Metadata } from "next"; 
import Navbar from "@/components/Navbar";
import "./globals.css";

// إضافة بيانات السيو المتقدمة لتغيير اسم الموقع في جوجل
export const metadata: Metadata = {
  title: {
    default: "أصوات البرج | منصة الروايات المترجمة",
    template: "%s | أصوات البرج",
  },
  description: "المكان الأول لأحدث الروايات المترجمة والحصرية بأسلوب عربي فصيح.",
  
  // إثبات ملكية جوجل (لا تلمس هذا الكود)
  verification: {
    google: "QCWLh4mWPB2AX43U4UtzDMwux8SU0ntiDJ_ybRfchcc",
  },

  // الكود المسؤول عن تغيير كلمة Vercel إلى اسم موقعك
  openGraph: {
    title: "أصوات البرج",
    description: "المكان الأول لأحدث الروايات المترجمة والحصرية بأسلوب عربي فصيح.",
    url: "https://tower-voices-pdf.vercel.app",
    siteName: "أصوات البرج", // هذا هو السطر الأهم لإجبار جوجل على تغيير الاسم
    locale: "ar_SA",
    type: "website",
  },

  // تعريف إضافي للأجهزة الذكية للمساعدة في الفهرسة
  other: {
    "apple-mobile-web-app-title": "أصوات البرج",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* رابط الأيقونة لضمان ظهور شعارك بدلاً من شعار Vercel في البحث */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-[#050505]">
        <Navbar /> 
        {children}
      </body>
    </html>
  );
}