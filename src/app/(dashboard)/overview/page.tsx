'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { OverviewCard } from '@/components/pages/overview/overview-card';
import { TotalGuestChart } from '@/components/pages/overview/total-guest-card';
import { useOverviewStore } from '@/hooks/overview/use-overview';
import { RevenueBreakdownChart } from '@/components/pages/overview/revenue-breakdown-card';
import { BookingManagementList } from '@/components/pages/booking-management/booking-management-list';
import { RevenueOverviewChart } from '@/components/pages/overview/revenue-overview-card';
import { useLeviCampSocket } from '@/hooks/use-levicamp-socket';
import { useSensorStore } from '@/stores/use-sensor-store';
import { SiteCard } from '@/components/monitoring/site-card';

export default function OverviewPage() {
	// Store hooks
	const {
		getOverviewMetrics,
		activeTents,
		growthRate,
		totalBookings,
		totalRevenue,
	} = useOverviewStore();

	useLeviCampSocket(); // cukup panggil sekali di sini

	const { history, connected, lastUpdate } = useSensorStore();

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				// Fetch overview metrics
				await getOverviewMetrics();
			} catch (error) {
				console.error('Error loading dashboard data:', error);
			}
		};

		loadDashboardData();
	}, [getOverviewMetrics]);

	// // Show skeleton loading state
	// if (overviewLoading) {
	// 	return <OverviewSkeleton />;
	// }

	return (
		<div className='space-y-4'>
			<div className='gap-4 grid md:grid-cols-2 lg:grid-cols-4'>
				<OverviewCard
					title='Revenue'
					amount={`Rp.${totalRevenue.amount.toLocaleString('id-ID')}`}
					percentage={`${totalRevenue.change > 0 ? '+' : ''}${
						totalRevenue.change
					}% from last month`}
					icon={totalRevenue.change < 0 ? TrendingDown : TrendingUp}
					tooltip='Total revenue generated from bookings'
				/>
				<OverviewCard
					title='Bookings'
					amount={`+${totalBookings.total}`}
					percentage={`${totalBookings.change > 0 ? '+' : ''}${
						totalBookings.change
					} from last month`}
					icon={totalBookings.change < 0 ? TrendingDown : TrendingUp}
					tooltip='Total number of bookings made'
				/>
				<OverviewCard
					title='Active Tents'
					amount={`${activeTents.active_tents}`}
					percentage={`${activeTents.total_tents + ' '}Total tents`}
					icon={activeTents.active_tents > 0 ? TrendingUp : TrendingDown}
					tooltip='Active tents vs total tents'
				/>
				<OverviewCard
					title='Growth Rate'
					amount={`${growthRate.percentage}%`}
					percentage={`${growthRate.change > 0 ? '+' : ''}${
						growthRate.change
					}% from last month`}
					icon={growthRate.change < 0 ? TrendingDown : TrendingUp}
					tooltip='Growth rate of the business'
				/>
			</div>
			<div className='gap-4 grid md:grid-cols-2 lg:grid-cols-7'>
				<RevenueOverviewChart />
				<RevenueBreakdownChart />
			</div>
			<TotalGuestChart />
			<div>
				<Card>
					<CardHeader>
						<CardTitle>Booking List</CardTitle>
					</CardHeader>
					<CardContent>
						<BookingManagementList />
					</CardContent>
				</Card>
			</div>
			<div className='space-y-6 p-6'>
				{/* Status bar */}
				<div className='flex justify-between items-center'>
					<h1 className='font-semibold text-xl'>Live Site Monitor</h1>
					<div className='flex items-center gap-2 text-sm'>
						<span
							className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
						/>
						<span>{connected ? 'Live' : 'Reconnecting...'}</span>
						{lastUpdate && (
							<span className='text-muted-foreground'>
								{lastUpdate.toLocaleTimeString()}
							</span>
						)}
					</div>
				</div>

				{/* Grid */}
				<div className='gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4'>
					{Object.entries(history).map(([id, entries]) => (
						<SiteCard key={id} siteId={id} history={entries} />
					))}
				</div>

				{Object.keys(history).length === 0 && (
					<p className='text-muted-foreground text-sm'>
						Waiting for sensor data...
					</p>
				)}
			</div>
		</div>
	);
}
