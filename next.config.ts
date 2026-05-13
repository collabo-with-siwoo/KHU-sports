import type { NextConfig } from "next";

const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";

function urlOrigin(value?: string) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function urlHostname(value?: string) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const supabaseOrigin = urlOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const r2PublicHostname = urlHostname(process.env.R2_PUBLIC_BASE_URL);

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  [
    "img-src 'self' data: blob:",
    "https://lh3.googleusercontent.com",
    "https://*.r2.dev",
    r2PublicHostname ? `https://${r2PublicHostname}` : null
  ]
    .filter(Boolean)
    .join(" "),
  ["connect-src 'self'", supabaseOrigin].filter(Boolean).join(" "),
  "upgrade-insecure-requests"
].join("; ");

const nextConfig: NextConfig = {
  output: isGithubPagesBuild ? "export" : undefined,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()"
          },
          {
            key: "Content-Security-Policy",
            value: csp
          }
        ]
      }
    ];
  },
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: "8mb"
    }
  },
  images: {
    unoptimized: isGithubPagesBuild,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "**.r2.dev"
      },
      ...(r2PublicHostname ? [{ protocol: "https" as const, hostname: r2PublicHostname }] : [])
    ]
  }
};

export default nextConfig;
