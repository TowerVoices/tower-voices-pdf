import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* أي إعدادات أخرى موجودة لديك اتركها هنا */

  webpack: (config) => {
    // هذا الجزء هو الحل؛ يخبر المشروع بتجاهل مكتبة canvas التي تسبب الخطأ الأحمر
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;