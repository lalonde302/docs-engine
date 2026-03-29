import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: false,
	},

	eslint: {
		ignoreDuringBuilds: false,
	},

	// Allow reading markdown files from content directory
	webpack: (config) => {
		config.resolve.fallback = { fs: false, path: false };
		return config;
	},
};

export default nextConfig;
