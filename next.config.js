/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore TypeScript errors during build (for Vercel deployment)
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Webpack configuration for non-Turbopack builds
  webpack: (config, { isServer }) => {
    // Fix for fluent-ffmpeg
    config.resolve.alias = {
      ...config.resolve.alias,
      './lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg',
    };
    
    // If client-side, don't polyfill Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        'fs-extra': false,
        'original-fs': false,
        'graceful-fs': false,
        'fs/promises': false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
        util: false,
        assert: false,
        constants: false,
        querystring: false,
        'stream/web': false,
      };
    }
    
    return config;
  },
  // Add transpilePackages for any problematic packages
  transpilePackages: ['fluent-ffmpeg'],
  
  // Specify packages that should only be loaded on the server
  // This ensures these packages are never bundled on the client side
  serverExternalPackages: [
    'whatsapp-web.js',
    'archiver',
    'puppeteer',
    'puppeteer-core',
    'qrcode-terminal'
  ],
  
  // Configure image domains for next/image
  images: {
    domains: ['images.unsplash.com', 'sbftdzhrujfuyjvhsckp.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sbftdzhrujfuyjvhsckp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Turbopack configuration
  experimental: {
    turbo: {
      resolveAlias: {
        './lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg',
      },
    }
  },
};

module.exports = nextConfig;
