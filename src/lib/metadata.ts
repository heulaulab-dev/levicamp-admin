import { Metadata } from 'next/types';

export const siteConfig = {
	name: 'Levicamp Admin',
	description:
		'Powerful admin panel for managing Levicamp reservations, tent allocations, user details, and operational settings with ease.',
	url: 'https://admin.levicamp.id',
	ogImage: 'https://assets.levicamp.id/assets/images/og-image.jpg',
	ogImageSquare: 'https://assets.levicamp.id/assets/images/og-image-square.jpg',
};

export function createMetadata({
	title,
	description,
	path = '',
	noIndex = true,
}: {
	title?: string;
	description?: string;
	path?: string;
	noIndex?: boolean;
}): Metadata {
	const finalTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;

	return {
		title: finalTitle,
		description: description || siteConfig.description,
		metadataBase: new URL(siteConfig.url),
		robots: {
			index: !noIndex,
			follow: !noIndex,
			googleBot: {
				'index': !noIndex,
				'follow': !noIndex,
				'max-image-preview': 'none',
				'max-snippet': -1,
			},
		},
		openGraph: {
			title: finalTitle,
			description: description || siteConfig.description,
			url: path ? `${siteConfig.url}${path}` : siteConfig.url,
			type: 'website',
			locale: 'en_US',
			siteName: siteConfig.name,
			images: [
				{
					url: siteConfig.ogImage,
					width: 1200,
					height: 630,
					alt: siteConfig.description,
				},
				{
					url: siteConfig.ogImageSquare,
					width: 300,
					height: 300,
					alt: siteConfig.description,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: finalTitle,
			description: description || siteConfig.description,
			images: [siteConfig.ogImage],
		},
	};
}
