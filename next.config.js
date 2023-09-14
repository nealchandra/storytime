/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/py/docs',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/docs'
            : '/api/py/docs',
      },
      {
        source: '/api/py/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/api/py/:path*'
            : '/api/py',
      },
      {
        source: '/openapi.json',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/openapi.json'
            : '/api/py/openapi.json',
      },
    ];
  },
};

module.exports = nextConfig;
