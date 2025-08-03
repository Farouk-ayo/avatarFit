import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Webpack configuration for Three.js
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("canvas");
    }

    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader", "glslify-loader"],
    });

    return config;
  },

  images: {
    domains: ["localhost"],
    unoptimized: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },

  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};

export default nextConfig;
