/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
  // Gelecekte API entegrasyonu için CORS ayarları
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With,content-type,Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
