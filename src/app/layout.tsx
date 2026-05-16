import { ReactScan } from '@/components/common/react-scan';
import { ThemeProvider } from '@/components/theme-provider';
import { plusJakartaSans } from '@/lib/fonts';
import { createMetadata } from '@/lib/metadata';
import { Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#09090b' },
	],
};

export const metadata = createMetadata({});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<ReactScan />
			<body className={` ${plusJakartaSans} antialiased`}>
				<ThemeProvider
					attribute='class'
					defaultTheme='light'
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
