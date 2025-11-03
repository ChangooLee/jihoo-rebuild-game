const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/jihoo',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '/jihoo',
  output: 'standalone', // PM2를 위한 standalone 빌드
}

module.exports = withPWA(nextConfig)

