import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  // three.js ships untranspiled ESM in a few subpaths
  transpilePackages: ['three'],
  experimental: {
    optimizePackageImports: ['gsap', '@react-three/drei'],
  },
}

export default nextConfig
