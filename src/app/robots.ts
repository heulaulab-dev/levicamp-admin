import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || 'https://admin.levicamp.id';

	// Baik di development maupun production, kita block semua crawler
	return {
		rules: [
			{
				userAgent: '*',
				disallow: '/', // Block semua path
			},
			{
				userAgent: 'GPTBot', // Block ChatGPT crawler
				disallow: '/',
			},
			{
				userAgent: 'CCBot', // Block Claude crawler
				disallow: '/',
			},
			{
				userAgent: 'Googlebot',
				disallow: '/',
			},
			{
				userAgent: 'Bingbot',
				disallow: '/',
			},
		],
		host: baseUrl,
	};
}
