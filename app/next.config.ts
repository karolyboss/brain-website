import path from 'path';

const nextConfig = {
  output: 'export', // 👈 This makes it static
  turbo: {
    root: path.join(__dirname, '.'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;