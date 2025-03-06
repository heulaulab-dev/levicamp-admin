import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,
	images: {
		domains: [
			'www.alltrekoutdoor.com', // Add this domain
			// Include any other domains you're already using
			'api.levicamp.id',
			'storage.googleapis.com',
			'localhost',
			'example.com',
			'89.116.34.215',
			// Add any other domains your images might come from
		],
	},
};

export default nextConfig;
