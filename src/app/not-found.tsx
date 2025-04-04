'use client';

import { RainbowButton } from '@/components/ui/rainbow-button';
import { useRouter } from 'next/navigation';

export default function NotFound() {
	const router = useRouter();

	return (
		<div className='flex flex-col justify-center items-center px-4 min-h-screen text-center'>
			<div className='space-y-5'>
				<h1 className='font-bold text-gray-800 dark:text-gray-200 text-6xl'>
					404
				</h1>
				<h2 className='font-medium text-gray-600 dark:text-gray-400 text-xl'>
					Page not found
				</h2>
				<p className='text-gray-500 dark:text-gray-500 text-sm'>
					The page you are looking for doesn&apos;t exist or has been moved.
				</p>
				<div className='pt-4'>
					<RainbowButton onClick={() => router.push('/')}>
						Back to Home
					</RainbowButton>
				</div>
			</div>
		</div>
	);
}
