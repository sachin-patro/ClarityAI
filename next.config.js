/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle pdf-parse package
    if (isServer) {
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse'
      })
    }
    return config
  }
}

module.exports = nextConfig 