import {
	CalendarFold,
	LucideHome,
	PieChartIcon,
	ReceiptText,
	Users,
} from 'lucide-react';

export const NavigationItem = [
	{
		title: 'Overview',
		url: '/overview',
		icon: PieChartIcon,
		isActive: true,
	},
	{
		title: 'Booking Management',
		url: '/booking-management',
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
		title: 'Refund Management',
		url: '/refund-management',
		icon: ReceiptText,
	},
	{
		title: 'Admin Management',
		url: '/admin-management',
		icon: Users,
	},
];
