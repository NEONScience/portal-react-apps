/* eslint-disable no-underscore-dangle */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDevEnv = (process.env.NODE_ENV === 'development');
const isBuildContainer = (process.env.PORTAL_NEXT_APP_BUILD_CONTAINER === 'true');

const allowedDevOrigins = ['localhost'];
if (process.env.NEXT_PUBLIC_NEON_ALLOWED_DEV_ORIGIN) {
  allowedDevOrigins.push(process.env.NEXT_PUBLIC_NEON_ALLOWED_DEV_ORIGIN);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isDevEnv ? undefined : 'export',
  distDir: 'build',
  basePath: '/data-products',
  trailingSlash: false,
  reactStrictMode: false,
  transpilePackages: ['@neonscience/portal-core-components'],
  turbopack: {
    root: isBuildContainer ? path.join(__dirname, '..', '..') : undefined,
  },
  allowedDevOrigins,
};

export default nextConfig;
