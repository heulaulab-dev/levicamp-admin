/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/contexts/sidebar-context';
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
	SidebarProvider as UISidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from 'sonner';
import { usePathname, useSearchParams } from 'next/navigation';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore, useInitAuth } from '@/hooks/auth/useAuth';
import React, { useEffect, useState } from 'react';
import { NavigationItem } from '@/constants/navigation';
import { SettingsIcon } from 'lucide-react';
import { BottomProgress } from '@/components/ui/progress-bar';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);

	// Show loading bar on route changes
	useEffect(() => {
		const handleRouteChangeStart = () => {
			setIsLoading(true);
		};

		const handleRouteChangeComplete = () => {
			setIsLoading(false);
		};

		// This effect runs when the route changes
		setIsLoading(true);

		// Small delay to ensure the loading bar is visible
		const timeout = setTimeout(() => {
			setIsLoading(false);
		}, 500);

		return () => clearTimeout(timeout);
	}, [pathname, searchParams]);

	// Create breadcrumb segments from pathname
	const pathSegments = pathname.split('/').filter(Boolean);

	// Generate breadcrumb items with proper paths
	const breadcrumbItems = pathSegments.map((segment, index) => {
		const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
		const name =
			segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
		return { name, href };
	});

	useInitAuth();

	const { user } = useAuthStore();

	return (
		<SidebarProvider items={NavigationItem}>
			<UISidebarProvider>
				<AppSidebar />
				<SidebarInset className='overflow-hidden'>
					<header className='group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 flex justify-between items-center gap-2 shadow-sm w-full h-16 transition-[width,height] ease-linear shrink-0'>
						<div className='flex items-center gap-2 px-4'>
							<SidebarTrigger className='-ml-1' />
							<Separator orientation='vertical' className='mr-2 h-4' />
							<Breadcrumb>
								<BreadcrumbList>
									{breadcrumbItems.map((item, index) => (
										<React.Fragment key={item.href}>
											{index > 0 && (
												<BreadcrumbSeparator className='hidden md:block' />
											)}
											<BreadcrumbItem className='hidden md:block'>
												{index === 0 || index === breadcrumbItems.length - 1 ? (
													<BreadcrumbPage>{item.name}</BreadcrumbPage>
												) : (
													<BreadcrumbLink href={item.href}>
														{item.name}
													</BreadcrumbLink>
												)}
											</BreadcrumbItem>
										</React.Fragment>
									))}
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<div className='flex justify-between items-center gap-2 px-4'>
							<Link href='/settings'>
								<Button variant={'ghost'} size={'icon'}>
									<SettingsIcon />
								</Button>
							</Link>
							<Separator orientation='vertical' className='mr-2 h-4' />
							{user && <NavUser user={user} />}
						</div>
					</header>
					<div className='flex flex-col flex-1 gap-4 p-4 pt-0'>
						<Toaster richColors position='top-right' />
						<BottomProgress isLoading={isLoading} />
						{children}
					</div>
				</SidebarInset>
			</UISidebarProvider>
		</SidebarProvider>
	);
}
