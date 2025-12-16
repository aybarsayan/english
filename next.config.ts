import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/',
        permanent: true,
      },
      {
        source: '/forgot-password',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
