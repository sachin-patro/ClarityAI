/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle pdf-parse test files
    if (isServer) {
      config.resolve.alias['pdf-parse'] = 'pdf-parse/lib/pdf-parse.js';
    }
    return config;
  },
}

module.exports = nextConfig 