import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || 'https://admin.levicamp.id';

	// Static routes
	const staticRoutes = [
		// Root/home page
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'monthly' as const,
			priority: 1.0,
		},
		// Auth pages tidak masuk sitemap karena private
		// Dashboard pages - Sesuaikan dengan route aktual
		{
			url: `${baseUrl}/dashboard`,
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: 0.9,
		},
		// Tambahkan route lain yang relevan
	];

	// Di sini bisa ditambahkan fetch dynamic routes jika diperlukan
	// contoh: products, blog posts, dll
	// const dynamicRoutes = await fetchDynamicRoutes();

	return [...staticRoutes];
}
