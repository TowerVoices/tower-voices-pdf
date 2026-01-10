// app/api/pdf-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  if (!fileId) return new NextResponse('ID مطلوب', { status: 400 });

  // استخدام رابط التصدير المباشر لتجاوز واجهات معاينة قوقل
  const driveUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

  try {
    const response = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) throw new Error('فشل الوصول إلى درايف');

    const blob = await response.blob();
    
    // التأكد من أننا نرسل PDF فعلاً للقارئ
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*', // السماح للمتصفح بقراءة الملف
      },
    });
  } catch (error) {
    return new NextResponse('الملف مفقود أو الرابط غير صالح', { status: 404 });
  }
}