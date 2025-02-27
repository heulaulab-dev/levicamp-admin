import { CalendarFold, LucideHome, PieChartIcon, Users } from 'lucide-react';

export const NavigationItem = [
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
];
