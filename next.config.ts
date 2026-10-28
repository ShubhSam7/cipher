import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow isolated local review builds alongside an existing development server.
  distDir: process.env.CIPHER_BUILD_DIR || ".next",
};

export default nextConfig;
