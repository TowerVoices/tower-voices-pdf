// app/api/pdf-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  if (!fileId) {
    return NextResponse.json({ error: 'Missing file ID' }, { status: 400 });
  }

  // رابط التنزيل المباشر من قوقل درايف
  const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  try {
    const response = await fetch(driveUrl);
    
    if (!response.ok) throw new Error('فشل جلب الملف من قوقل درايف');

    // إرسال الملف للقارئ مع الترويسات الصحيحة
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الجسر البرمي' }, { status: 500 });
  }
}