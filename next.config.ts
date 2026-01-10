import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. حل مشكلة القارئ بتجاهل مكتبة canvas
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },

  // 2. حل مشكلة التعارض مع Turbopack في Next.js 16
  experimental: {
    turbopack: {}, 
  },
};

export default nextConfig;