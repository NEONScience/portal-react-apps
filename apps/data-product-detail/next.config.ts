import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA)
  distDir: 'build',
  basePath: '/data-products',
  trailingSlash: false,
  reactStrictMode: false,
};

export default nextConfig;
