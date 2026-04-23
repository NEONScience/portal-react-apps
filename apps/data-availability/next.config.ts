import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA)
  distDir: 'build',
  basePath: '/visualizations/data-availability',
  trailingSlash: false,
  reactStrictMode: false,
};

export default nextConfig;
