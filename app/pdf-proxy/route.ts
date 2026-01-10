import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    if (!fileId) return new NextResponse('Missing ID', { status: 400 });

    // رابط تحميل مباشر ومستقر من قوقل درايف
    const driveUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

    const response = await fetch(driveUrl);

    if (!response.ok) {
      return new NextResponse('Drive access denied or file not found', { status: response.status });
    }

    const blob = await response.blob();
    
    // التحقق من أن ما استلمناه هو PDF فعلاً وليس صفحة خطأ من قوقل
    if (!blob.type.includes('pdf')) {
      return new NextResponse('The link provided is not a direct PDF. Ensure the file is shared as "Anyone with the link".', { status: 403 });
    }

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}