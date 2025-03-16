/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  env: {
    TZ: 'Asia/Kolkata'
  }
}

module.exports = nextConfig 