"use client"

import * as React from 'react';

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

export function TeamSwitcher({
	team = {
		name: 'Levicamp',
		logo: () => <div className='flex justify-center items-center'>L</div>,
		plan: 'Admin Panel',
	},
}: {
	team?: {
		name: string;
		logo: React.ElementType;
		plan: string;
	};
}) {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size='lg' className='pointer-events-none'>
					<div className='flex justify-center items-center bg-sidebar-primary rounded-lg size-8 aspect-square text-sidebar-primary-foreground'>
						<team.logo className='size-4' />
					</div>
					<div className='flex-1 grid text-sm text-left leading-tight'>
						<span className='font-semibold truncate'>{team.name}</span>
						<span className='text-xs truncate'>{team.plan}</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}