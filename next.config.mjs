/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "cdn.assetivo.store"
      },
      {
        protocol: "https",
        hostname: "*.r2.dev"
      }
    ]
  }
};

export default nextConfig;
