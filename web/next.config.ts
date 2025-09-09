import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      // 앞으로 쓸 예정이라면 같이 추가
      // { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      // { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
