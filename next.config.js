/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "randomuser.me",
      "jbagy.me",
      "res.cloudinary.com",
      "example.com",
      "img.freepik.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // destination: "https://job-finder-kjt2.onrender.com/api/:path*", // Chuyển tiếp request đến backend
        destination: "http://localhost:5194/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
