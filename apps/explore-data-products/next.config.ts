import type { NextConfig } from 'next';

const isProd = process.env.PORTAL_REACT_APPS_ENV === 'prod';

const nextConfig: NextConfig = {
  output: isProd ? 'export' : undefined,
  distDir: 'build',
  basePath: '/data-products/explore',
  trailingSlash: false,
  reactStrictMode: false,
};

export default nextConfig;
