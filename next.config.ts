import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for react-svg-pan-zoom missing module
    config.resolve.alias = {
      ...config.resolve.alias,
      '../utils/calculateBox': path.resolve(__dirname, 'src/utils/calculateBox.js'),
    };
    
    return config;
  },
};

export default nextConfig;
