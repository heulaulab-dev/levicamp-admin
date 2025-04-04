import { ReactScan } from '@/components/common/react-scan';
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
		<html lang='en'>
			<ReactScan />
			<body className={` ${plusJakartaSans} antialiased`}>{children}</body>
		</html>
	);
}
