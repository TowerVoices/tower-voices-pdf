import type { Metadata } from "next"; // استيراد نوع الميتا داتا
import Navbar from "@/components/Navbar";
import "./globals.css";

// إضافة بيانات السيو وإثبات ملكية جوجل
export const metadata: Metadata = {
  title: "أصوات البرج | منصة الروايات المترجمة",
  description: "المكان الأول لأحدث الروايات المترجمة والحصرية بأسلوب عربي فصيح.",
  verification: {
    // كود التحقق الذي نسخته من جوجل
    google: "QCWLh4mWPB2AX43U4UtzDMwux8SU0ntiDJ_ybRfchcc",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050505]">
        {/* الشريط سيظهر الآن في أعلى كل الصفحات تلقائياً */}
        <Navbar /> 
        
        {children}
      </body>
    </html>
  );
}
