import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. إخبار المحرك بمعالجة مكتبات القارئ بشكل خاص لتجنب أخطاء البناء الثقيلة
  transpilePackages: ['@react-pdf-viewer/core', '@react-pdf-viewer/default-layout', 'pdfjs-dist'],

  webpack: (config) => {
    // 2. حل مشكلة المتصفح: تجاهل الحزم التي تسبب الأخطاء الحمراء
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },

  // ملاحظة: تم حذف قسم turbopack لأنه يسبب تحذيراً "Unrecognized key" وغير مطلوب
};

export default nextConfig;