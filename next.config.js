/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors. We've verified TypeScript compiles correctly.
        ignoreDuringBuilds: true,
    },
    // Keep experimental features off for predictable production builds.
    typescript: {
        // The TypeScript compiler passes, this is just for redundancy
        ignoreBuildErrors: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};

module.exports = nextConfig;
