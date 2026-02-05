import type { Metadata } from "next"; 
import Navbar from "@/components/Navbar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// 1. إعدادات السيو الأساسية (Metadata)
export const metadata: Metadata = {
  title: {
    default: "أصوات البرج | منصة الروايات المترجمة",
    template: "%s | أصوات البرج",
  },
  description: "المكان الأول لأحدث الروايات المترجمة والحصرية بأسلوب عربي فصيح.",
  
  verification: {
    google: "QCWLh4mWPB2AX43U4UtzDMwux8SU0ntiDJ_ybRfchcc", // إثبات الملكية
  },

  openGraph: {
    title: "أصوات البرج",
    description: "المكان الأول لأحدث الروايات المترجمة والحصرية بأسلوب عربي فصيح.",
    url: "https://towervoices.online",
    siteName: "أصوات البرج", 
    locale: "ar_SA",
    type: "website",
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
  // 2. كود الـ Schema لتعريف المسارات (Breadcrumbs JSON-LD)
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
        {/* حقن كود الـ Schema في رأس الصفحة لتعرفه محركات البحث فوراً */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>
      <body className="bg-[#050505]">
        <Navbar /> 
        {children}
        
        {/* قياس السرعة لتحسين السيو التقني */}
        <SpeedInsights /> 
      </body>
    </html>
  );
}