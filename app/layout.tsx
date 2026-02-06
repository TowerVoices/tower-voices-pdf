import type { Metadata } from "next"; 
import Navbar from "@/components/Navbar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// 1. إعدادات السيو الاحترافية الموجهة لجمهور ريزيرو
export const metadata: Metadata = {
  title: {
    // العنوان الافتراضي للصفحة الرئيسية (غني بكلمات البحث القوية)
    default: "أصوات البرج | أرشيف ترجمة Re:Zero و Re:Zero EX بالعربية",
    // القالب الذي سيمنع تكرار الاسم تلقائياً في الصفحات الفرعية
    template: "%s | أصوات البرج",
  },
  description: "المكان الأول والحصري لقراءة رواية ريزيرو Re:Zero بجميع أجزائها (المجلدات، EX، وقصص الـ IF) مترجمة بأسلوب عربي فصيح.",
  
  // استهداف كلمات البحث العالمية في الهيكل الأساسي للموقع
  keywords: ["ريزيرو", "ري زيرو", "Re:Zero", "Re Zero", "رواية ريزيرو مترجمة", "أصوات البرج", "Tower Voices", "روايات خفيفة", "Light Novel", "ترجمة روايات"],

  verification: {
    google: "QCWLh4mWPB2AX43U4UtzDMwux8SU0ntiDJ_ybRfchcc", 
  },

  openGraph: {
    title: "أصوات البرج - مرجع رواية Re:Zero بالعربية",
    description: "الأرشيف الشامل لترجمة سلسلة Re:Zero الحصرية، من المجلدات الرئيسية إلى القصص الجانبية.",
    url: "https://towervoices.online",
    siteName: "أصوات البرج", 
    locale: "ar_SA",
    type: "website",
  },

  // حل مشكلة Twitter Card على مستوى الموقع بالكامل
  twitter: {
    card: "summary_large_image",
    site: "@TowerVoices",
    creator: "@TowerVoices",
  },

  other: {
    "apple-mobile-web-app-title": "أصوات البرج",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": "https://towervoices.online"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "المكتبة",
        "item": "https://towervoices.online/works"
      }
    ]
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>
      <body className="bg-[#050505]">
        <Navbar /> 
        {children}
        <SpeedInsights /> 
      </body>
    </html>
  );
}