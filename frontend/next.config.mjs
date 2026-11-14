/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer'

const nextConfig = {
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Revisit responsive sizes, AVIF/WebP, and below-the-fold lazy loading if photos are added.
  },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://rental-listing-system.onrender.com/api/v1/:path*',
      },
    ];
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
