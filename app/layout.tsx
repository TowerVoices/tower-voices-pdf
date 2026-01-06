import Navbar from "@/components/Navbar"; // استدعاء الشريط من المجلد الجديد
import "./globals.css";

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