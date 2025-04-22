import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack'],
		});
		return config;
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'www.alltrekoutdoor.com',
			},
			{
				protocol: 'https',
				hostname: 'api.levicamp.id',
			},
			{
				protocol: 'https',
				hostname: 'assets.levicamp.id',
			},
			{
				protocol: 'http',
				hostname: '89.116.34.215',
			},

			{
				protocol: 'https',
				hostname: 'levicamp.id',
			},
		],
	},
	experimental: {
		turbo: {
			rules: {
				'*.svg': {
					loaders: ['@svgr/webpack'],
					as: '*.js',
				},
			},
		},
	},
};

export default nextConfig;
