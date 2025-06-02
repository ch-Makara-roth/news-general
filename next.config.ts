
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows all hostnames
        port: '',
        pathname: '**', // Allows all paths
      },
      {
        protocol: 'http',
        hostname: '**', // Allows all hostnames
        port: '',
        pathname: '**', // Allows all paths
      },
    ],
  },
};

export default nextConfig;
