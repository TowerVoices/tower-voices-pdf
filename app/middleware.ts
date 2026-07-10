import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // 1. تنظيف روابط بلوجر القديمة (إزالة m=1)
  if (url.searchParams.has('m')) {
    url.searchParams.delete('m') // احذف الرمز فوراً
    return NextResponse.redirect(url) // أعد توجيه القارئ للرابط النظيف
  }
  
  // 2. استكمال الطلب بشكل طبيعي
  const response = NextResponse.next()

  // 3. التقاط اللغة من الرابط (إن وجدت) وتمريرها للميتا داتا (ديسكورد/تويتر)
  const lang = url.searchParams.get('lang')
  if (lang) {
    response.headers.set('x-user-lang', lang)
  }

  return response
}

// تشغيل الـ Middleware على كل صفحات الموقع (باستثناء ملفات النظام والصور)
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}