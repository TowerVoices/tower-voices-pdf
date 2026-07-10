import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // إذا وجد الرابط يحتوي على m=1 (بقايا بلوجر القديمة)
  if (url.searchParams.has('m')) {
    url.searchParams.delete('m') // احذف الرمز فوراً
    return NextResponse.redirect(url) // أعد توجيه القارئ للرابط النظيف
  }
  
  return NextResponse.next()
}

// تشغيل الحماية على كل صفحات الموقع
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}