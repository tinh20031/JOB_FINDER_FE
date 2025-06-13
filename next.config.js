/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['randomuser.me', 'jbagy.me', 'res.cloudinary.com', 'example.com', 'img.freepik.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5194/api/:path*', // Chuyển tiếp request đến backend
      },
    ];
  },
}

module.exports = nextConfig