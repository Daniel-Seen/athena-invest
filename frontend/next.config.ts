import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: "/athena-invest",
  assetPrefix: "/athena-invest",
};

export default nextConfig;
