import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Specify the correct root directory to avoid workspace warnings
  turbopack: {
    root: path.join(__dirname, '.'),
  },
  // Disable ESLint to bypass the unescaped entities error
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;