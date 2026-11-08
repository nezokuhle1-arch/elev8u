import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: lets the dev server be opened via the machine's network address
  // (e.g. from a phone). Without this Next blocks its dev resources as
  // cross-origin, React never hydrates and buttons such as "Navigate" are dead.
  allowedDevOrigins: ["192.168.0.5"],
};

export default nextConfig;
