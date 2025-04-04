import '@/app/globals.css';
import { plusJakartaSans } from '@/lib/fonts';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
	title: 'Levicamp Admin - Login',
	description: 'Login to your Levicamp Admin Dashboard',
	path: '/login',
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className={`${plusJakartaSans} antialiased`}>{children}</div>;
}
