import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 1. إضافة إعدادات الصور للسماح بروابط Sanity وحل الخطأ */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  // 2. إخبار المحرك بمعالجة مكتبات القارئ بشكل خاص لتجنب أخطاء البناء الثقيلة
  transpilePackages: ['@react-pdf-viewer/core', '@react-pdf-viewer/default-layout', 'pdfjs-dist'],

  webpack: (config) => {
    // 3. حل مشكلة المتصفح: تجاهل الحزم التي تسبب الأخطاء الحمراء
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },

  // ملاحظة: تم حذف قسم turbopack لأنه يسبب تحذيراً "Unrecognized key" وغير مطلوب
};

export default nextConfig;