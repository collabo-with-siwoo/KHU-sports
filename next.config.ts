import type { NextConfig } from "next";

const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGithubPagesBuild ? "export" : undefined,
  experimental: {
    authInterrupts: true
  },
  images: {
    unoptimized: isGithubPagesBuild,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
