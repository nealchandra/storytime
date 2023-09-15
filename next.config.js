/** @type {import('next').NextConfig} */
const nextConfig = {
  proxyTimeout: 3 * 60 * 1000,
  rewrites: async () => {
    return [
      {
        source: '/api/py/docs',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/docs'
            : '/api/docs',
      },
      {
        source: '/api/py/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/api/py/:path*'
            : '/api',
      },
      {
        source: '/openapi.json',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/openapi.json'
            : '/api/openapi.json',
      },
    ];
  },
};

module.exports = nextConfig;
