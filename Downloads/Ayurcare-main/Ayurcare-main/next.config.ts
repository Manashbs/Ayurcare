import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon", "@neondatabase/serverless"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude native sqlite binaries that don't work on Vercel
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "better-sqlite3",
        "@prisma/adapter-better-sqlite3",
      ];
    }
    return config;
  },
};

export default nextConfig;
