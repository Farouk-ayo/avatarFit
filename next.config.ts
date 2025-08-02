import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,

  // Enable static file serving
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/uploads/:path*",
      },
    ];
  },

  // Webpack configuration for Three.js
  webpack: (config, { isServer }) => {
    // Handle canvas module for server-side rendering
    if (isServer) {
      config.externals.push("canvas");
    }

    // Handle Three.js examples
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader", "glslify-loader"],
    });

    return config;
  },

  // Image optimization
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },

  // Experimental features
  experimental: {
    esmExternals: false,
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  // API configuration
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};
