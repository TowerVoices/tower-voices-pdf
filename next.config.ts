import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // هذا الجزء لحل مشكلة القارئ (Webpack)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  // إضافة هذا الجزء لحل مشكلة Turbopack في Vercel
  experimental: {
    turbopack: {},
  },
};

export default nextConfig;