/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { Separator } from '@/components/ui/separator';
import {
	SidebarInset,
	SidebarProvider as UISidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore, useInitAuth } from '@/hooks/auth/useAuth';
import React, { useEffect, useState, Suspense } from 'react';
import { NavigationItem } from '@/constants/navigation';
import { SettingsIcon } from 'lucide-react';
import { BottomProgress } from '@/components/ui/progress-bar';
import { MobileDetectionDialog } from '@/components/common/mobile-detection-dialog';
import { BreadcrumbNavigation } from '@/components/common/BreadcrumbNavigation';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const [isLoading, setIsLoading] = useState(false);
	const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

	// Show loading bar on route changes
	useEffect(() => {
		// This effect runs when the route changes
		setIsLoading(true);

		// Small delay to ensure the loading bar is visible
		const timeout = setTimeout(() => {
			setIsLoading(false);
		}, 500);

		return () => clearTimeout(timeout);
	}, [pathname]);

	useInitAuth();

	const { user } = useAuthStore();

	return (
		<SidebarProvider items={NavigationItem}>
			<UISidebarProvider>
				<AppSidebar />
				<SidebarInset className='overflow-hidden'>
					<header className='flex justify-between items-center gap-2 shadow-xs w-full h-16 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 transition-[width,height] ease-linear shrink-0'>
						<div className='flex items-center gap-2 px-4'>
							<SidebarTrigger className='-ml-1' />
							<Separator orientation='vertical' className='mr-2 h-4' />
							<Suspense fallback={<div>Loading...</div>}>
								<BreadcrumbNavigation />
							</Suspense>
						</div>
						<div className='flex justify-between items-center gap-2 px-4'>
							<ThemeSwitcher onChange={setTheme} />
							<Separator
								orientation='vertical'
								className='my-1 bg-border h-full'
							/>
							{user && <NavUser user={user} />}
						</div>
					</header>
					<div className='flex flex-col flex-1 gap-4 p-4 pt-0'>
						<Toaster richColors position='top-right' />
						<BottomProgress isLoading={isLoading} />
						{/* Mobile detection dialog */}
						<MobileDetectionDialog />
						{children}
					</div>
				</SidebarInset>
			</UISidebarProvider>
		</SidebarProvider>
	);
}
