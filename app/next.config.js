/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-host.com'],
  },
  // Enable static exports for `next export`
  output: 'export',
  // Optional: Add a trailing slash to all paths
  trailingSlash: true,
  // Optional: Configure the base path if your app is not served from the root
  // basePath: '/your-base-path',
  // Optional: Configure the asset prefix if your app is served from a subdirectory
  // assetPrefix: '/your-asset-prefix/',
}

module.exports = nextConfig