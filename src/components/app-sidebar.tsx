'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenu,
	SidebarRail,
} from '@/components/ui/sidebar';

import { NavigationItem } from '@/constants/navigation';
import Image from 'next/image';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible='icon' {...props} className=''>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size='lg' className='pointer-events-none'>
							<div className='flex justify-center items-center bg-sidebar-primary rounded-lg size-8 aspect-square text-sidebar-primary-foreground'>
								<Image
									src='https://assets.levicamp.id/assets/logo/levicamp-logo-orange.png'
									alt='Levi Camp'
									width={120}
									height={120}
								/>
							</div>
							<div className='flex-1 grid text-sm text-left leading-tight'>
								<span className='font-semibold truncate'>Levi Camp</span>
								<span className='text-xs truncate'>Admin Panel</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={NavigationItem} />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
