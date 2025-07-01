/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      "randomuser.me",
      "jbagy.me",
      "res.cloudinary.com",
      "example.com",
      "img.freepik.com",
      "localhost",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Disable static generation for auth pages
  async generateStaticParams() {
    return [];
  },
  // Configure which pages should not be statically generated
  async rewrites() {
    return [
      {
        source: "/api/:path*",

        destination: "http://localhost:5194/api/:path*", // Chuyển tiếp request đến backend

        // destination: "https://job-finder-kjt2.onrender.com/api/:path*",
      },
      {
        source: "/auth/:path*",
        destination: "/auth/:path*",
      },
    ];
  },
  // Disable static optimization for auth pages
  async headers() {
    return [
      {
        source: "/auth/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
