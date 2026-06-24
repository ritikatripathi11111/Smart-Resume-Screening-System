/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  // Workaround for @next/swc-wasm-nodejs 13.5.1 minifier producing malformed
  // chunks during "Collecting page data" in this sandboxed environment.
  swcMinify: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
