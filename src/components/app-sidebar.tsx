'use client';

import * as React from 'react';
import { CalendarFold, LucideHome, PieChartIcon, Users } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { TeamSwitcher } from '@/components/team-switcher';
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from '@/components/ui/sidebar';

const data = {
	user: {
		name: 'shadcn',
		email: 'm@example.com',
		avatar: '/avatars/shadcn.jpg',
	},
	navMain: [
		{
			title: 'Overview',
			url: '/overview',
			icon: PieChartIcon,
			isActive: true,
		},
		{
			title: 'Reservation Management',
			url: '/reservation-management',
			icon: CalendarFold,
		},
		{
			title: 'Tent Management',
			url: '#',
			icon: LucideHome,
			items: [
				{
					title: 'Tent Categories',
					url: '/tent-management/tent-categories',
				},
				{
					title: 'Tents',
					url: '/tent-management/tents',
				},
			],
		},
		{
			title: 'Admin Management',
			url: '/admin-management',
			icon: Users,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<TeamSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
