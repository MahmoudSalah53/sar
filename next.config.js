/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.sar.com.sa',
      },
      {
        protocol: 'https',
        hostname: 'tickets.sar.com.sa',
      },
    ],
    unoptimized: false,
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig

