import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Disabled ppr to fix loading state issue in production
    ppr: false,
    serverMinification: false, // Prevent issues with large responses
  },
  images: {
    domains: ['images.unsplash.com', 'avatar.vercel.sh'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Increased for very large inputs
    },
    responseLimit: false, // Remove response size limit
    externalResolver: true, // Handle external processing
  },
  // Handle very large payloads
  serverRuntimeConfig: {
    maxRequestSize: '100mb',
    maxResponseSize: '100mb',
  },
  // Optimize for heavy usage
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Allow all hosts for Replit environment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
