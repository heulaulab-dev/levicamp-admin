'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';

import { AppSidebar } from '@/components/app-sidebar';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';

export default function Dashboard() {
	const searchParams = useSearchParams();
	const loginSuccess = searchParams.get('loginSuccess');
	const [toastShown, setToastShown] = useState(false); // Tambahin state

	useEffect(() => {
		if (loginSuccess && !toastShown) {
			toast.success('Successfully logged in!', {
				description: 'Welcome to your dashboard!',
			});
			setToastShown(true); // Set supaya toast ga muncul lagi

			// Hapus query param biar ga kepanggil lagi
			window.history.replaceState({}, '', '/overview');
		}
	}, [loginSuccess, toastShown]); // Tambahin toastShown ke dependency biar hanya sekali

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className='group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 flex items-center gap-2 h-16 transition-[width,height] ease-linear shrink-0'>
					<div className='flex items-center gap-2 px-4'>
						<SidebarTrigger className='-ml-1' />
						<Separator orientation='vertical' className='mr-2 h-4' />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className='hidden md:block'>
									<BreadcrumbLink href='#'>
										Building Your Application
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className='hidden md:block' />
								<BreadcrumbItem>
									<BreadcrumbPage>Data Fetching</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className='flex flex-col flex-1 gap-4 p-4 pt-0'>
					<div className='gap-4 grid md:grid-cols-3 auto-rows-min'>
						<Toaster richColors position='top-right' />
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
