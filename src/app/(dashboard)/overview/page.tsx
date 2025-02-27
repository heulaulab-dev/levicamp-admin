'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function Overview() {
	const searchParams = useSearchParams();
	const loginSuccess = searchParams.get('loginSuccess');
	const [toastShown, setToastShown] = useState(false);

	useEffect(() => {
		if (loginSuccess && !toastShown) {
			toast.success('Successfully logged in!', {
				description: 'Welcome to your dashboard!',
			});
			setToastShown(true);

			// Remove query param to avoid showing toast again
			window.history.replaceState({}, '', '/overview');
		}
	}, [loginSuccess, toastShown]);

	return (
		<>
			<div className='gap-4 grid md:grid-cols-3 auto-rows-min'>
				{/* Your dashboard content here */}
			</div>
		</>
	);
}
