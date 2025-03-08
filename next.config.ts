import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
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
