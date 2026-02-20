import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-3536548244b54933880908bb0b39c14d.r2.dev",
      },
    ],
  },
};

export default nextConfig;
