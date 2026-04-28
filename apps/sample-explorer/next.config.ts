import type { NextConfig } from 'next';

const isProd = process.env.PORTAL_REACT_APPS_ENV === 'prod';

const nextConfig: NextConfig = {
  output: isProd ? 'export' : undefined,
  distDir: 'build',
  basePath: '/sample-explorer',
  trailingSlash: false,
  reactStrictMode: false,
};

export default nextConfig;
