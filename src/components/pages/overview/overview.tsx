'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingList } from '@/components/pages/overview/booking-list';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { OverviewCard } from './OverviewCard';
import { TotalGuestChart } from './TotalGuestChart';
import { RevenueChart } from './RevenueChart';
import { RevenueBreakdown } from './RevenueBreakdown';

const overviewData = {
	total_revenue: {
		amount: 12500,
		change: 12.5,
		period: 'last_month',
	},
	total_bookings: {
		total: 573,
		change: -10,
		period: 'last_month',
	},
	active_tents: {
		total: 24,
		change: 3,
		period: 'last_month',
	},
	growth_rate: {
		percentage: 12.5,
		change: 2.1,
		period: 'last_month',
	},
};

export function Overview() {
	const data = overviewData;
	return (
		<div className='space-y-4'>
			<div className='gap-4 grid md:grid-cols-2 lg:grid-cols-4'>
				<OverviewCard
					title='Revenue'
					amount={`RP.${data.total_revenue.amount.toLocaleString('id-ID')}`}
					percentage={`${data.total_revenue.change > 0 ? '+' : ''}${
						data.total_revenue.change
					}% from last month`}
					icon={data.total_revenue.change < 0 ? TrendingDown : TrendingUp}
					tooltip='Total revenue generated from bookings'
				/>
				<OverviewCard
					title='Bookings'
					amount={`+${data.total_bookings.total}`}
					percentage={`${data.total_bookings.change > 0 ? '+' : ''}${
						data.total_bookings.change
					} from last month`}
					icon={data.total_bookings.change < 0 ? TrendingDown : TrendingUp}
					tooltip='Total number of bookings made'
				/>
				<OverviewCard
					title='Active Tents'
					amount={`${data.active_tents.total}`}
					percentage={`${data.active_tents.change > 0 ? '+' : ''}${
						data.active_tents.change
					} from last month`}
					icon={data.active_tents.change < 0 ? TrendingDown : TrendingUp}
					tooltip='Total number of active tents'
				/>
				<OverviewCard
					title='Growth Rate'
					amount={`${data.growth_rate.percentage}%`}
					percentage={`${data.growth_rate.change > 0 ? '+' : ''}${
						data.growth_rate.change
					}% from last month`}
					icon={data.growth_rate.change < 0 ? TrendingDown : TrendingUp}
					tooltip='Growth rate of the business'
				/>
			</div>
			<div className='gap-4 grid md:grid-cols-2 lg:grid-cols-7'>
				<RevenueChart />
				<RevenueBreakdown />
			</div>
			<TotalGuestChart />
			<div className='gap-4 grid'>
				<Card>
					<CardHeader>
						<CardTitle>Booking List</CardTitle>
					</CardHeader>
					<CardContent>
						<BookingList />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
