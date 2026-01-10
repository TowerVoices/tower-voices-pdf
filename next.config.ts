import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إخبار المحرك بمعالجة مكتبات القارئ بشكل خاص لتجنب أخطاء البناء
  transpilePackages: ['@react-pdf-viewer/core', '@react-pdf-viewer/default-layout', 'pdfjs-dist'],

  webpack: (config) => {
    // تجاهل الحزم التي تسبب الأخطاء في المتصفح
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  
  // ترك هذا فارغاً لإرضاء محرك Turbopack إذا حاول العمل
  experimental: {
    turbopack: {},
  },
};

export default nextConfig;