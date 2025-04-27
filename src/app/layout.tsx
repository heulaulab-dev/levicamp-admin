import { ReactScan } from '@/components/common/react-scan';
import { ThemeProvider } from '@/components/theme-provider';
import { plusJakartaSans } from '@/lib/fonts';
import { createMetadata } from '@/lib/metadata';
import './globals.css';

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
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
