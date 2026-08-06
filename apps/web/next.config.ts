import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["paying-victory-sagging.ngrok-free.dev", "localhost:3001"],
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
