const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  compiler: {
    // Remove console calls from production bundles
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
