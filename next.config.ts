import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Never advertise runtime details through response headers.
  poweredByHeader: false,
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
      // Safe with Next.js inline hydration scripts and the existing WebGL hero.
      // A strict script-src CSP requires a separate nonce-based deployment.
      { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'" },
    ];
    if (process.env.BETTER_AUTH_URL?.startsWith("https://")) {
      securityHeaders.push({ key: "Strict-Transport-Security", value: "max-age=31536000" });
    }
    const privateHeaders = [{ key: "Cache-Control", value: "private, no-store, max-age=0" }];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: privateHeaders },
      { source: "/account/:path*", headers: privateHeaders },
      { source: "/admin/:path*", headers: privateHeaders },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/home/images/icons/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
