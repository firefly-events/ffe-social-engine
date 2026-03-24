import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@ffe/db', '@ffe/core'],
  experimental: {
    // React 19 is stable in Next.js 16
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
}

export default nextConfig
