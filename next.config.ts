import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // هذا الجزء لحل مشكلة القارئ بتجاهل مكتبة canvas المفقودة
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  // حل مشكلة Turbopack كما هو مطلوب في سجلات Vercel
  experimental: {
    turbopack: {},
  },
};

export default nextConfig;