import type { NextConfig } from "next";

/**
 * The pre-seeded SQLite snapshot must ship with every API route bundle so
 * the demo works on serverless platforms (Vercel) without external services.
 */
const DB_INCLUDES = ["./db/custom.db"];

const apiRoutes = [
  "/api",
  "/api/campaign",
  "/api/demo/reset",
  "/api/insights",
  "/api/register",
  "/api/student",
  "/api/students",
];

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  outputFileTracingIncludes: Object.fromEntries(
    apiRoutes.map((route) => [route, DB_INCLUDES])
  ),
};

export default nextConfig;
