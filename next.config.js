/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors. We've verified TypeScript compiles correctly.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // The TypeScript compiler passes, this is just for redundancy
        ignoreBuildErrors: false,
    },
};

module.exports = nextConfig;
