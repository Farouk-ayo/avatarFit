/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost", "blob.vercel-storage.com"],
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,

  // Webpack configuration for Three.js
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals.push("canvas");
    }
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader", "glslify-loader"],
    });
    return config;
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "200mb", // Increased to 200MB
    },
  },
};

export default nextConfig;
