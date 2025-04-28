'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { OverviewCard } from '@/components/pages/overview/overview-card';
import { TotalGuestChart } from '@/components/pages/overview/total-guest-card';
import { useOverviewStore } from '@/hooks/overview/useOverview';
import { useRevenueOverviewStore } from '@/hooks/overview/useRevenueOverview';
import { useRevenueBreakdownStore } from '@/hooks/overview/useRevenueBreakdown';
import { useTotalGuestStore } from '@/hooks/overview/useTotalGuest';
import { useBookingsStore } from '@/hooks/overview/useBookings';
import { useApiQueue } from '@/hooks/useApiQueue';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueBreakdownChart } from '@/components/pages/overview/revenue-breakdown-card';
import { BookingManagementList } from '@/components/pages/booking-management/booking-management-list';
import { RevenueOverviewChart } from '@/components/pages/overview/revenue-overview-card';

// Skeleton loading component for the overview cards
function OverviewSkeleton() {
	return (
		<div className='space-y-4'>
			{/* Overview Cards Skeletons */}
			<div className='gap-4 grid md:grid-cols-2 lg:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className='overflow-hidden'>
						<CardHeader className='pb-2'>
							<Skeleton className='w-24 h-5' />
							<div className='flex justify-between items-center'>
								<Skeleton className='w-28 h-8' />
								<Skeleton className='rounded-full w-8 h-8' />
							</div>
							<Skeleton className='mt-1 w-36 h-4' />
						</CardHeader>
					</Card>
				))}
			</div>

			{/* Revenue Charts Skeletons */}
			<div className='gap-4 grid md:grid-cols-2 lg:grid-cols-7'>
				<div className='col-span-4'>
					<Card>
						<CardHeader>
							<Skeleton className='w-32 h-5' />
							<Skeleton className='w-48 h-4' />
						</CardHeader>
						<CardContent>
							<Skeleton className='w-full h-[200px]' />
						</CardContent>
					</Card>
				</div>
				<div className='col-span-3'>
					<Card>
						<CardHeader>
							<Skeleton className='w-32 h-5' />
							<Skeleton className='w-48 h-4' />
						</CardHeader>
						<CardContent>
							<Skeleton className='rounded-full w-full h-[200px]' />
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Total Guest Chart Skeleton */}
			<Card>
				<CardHeader>
					<Skeleton className='w-32 h-5' />
					<Skeleton className='w-48 h-4' />
				</CardHeader>
				<CardContent>
					<Skeleton className='w-full h-[250px]' />
				</CardContent>
			</Card>

			{/* Booking List Skeleton */}
			<Card>
				<CardHeader>
					<Skeleton className='w-32 h-5' />
				</CardHeader>
				<CardContent>
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className='flex justify-between items-center py-2'>
							<Skeleton className='w-52 h-4' />
							<Skeleton className='w-24 h-4' />
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

export default function OverviewPage() {
	const { queueRequest } = useApiQueue();

	// Store hooks
	const {
		getOverviewMetrics,
		isLoading: overviewLoading,
		activeTents,
		growthRate,
		totalBookings,
		totalRevenue,
	} = useOverviewStore();

	const { getRevenueOverview } = useRevenueOverviewStore();
	const { getRevenueBreakdown } = useRevenueBreakdownStore();
	const { getTotalGuestData } = useTotalGuestStore();
	const { getBookings } = useBookingsStore();

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				// Queue all requests with different priorities
				await Promise.all([
					// High priority - main metrics
					queueRequest('overview-metrics', () => getOverviewMetrics(), 3),

					// Medium priority - charts
					queueRequest('revenue-overview', () => getRevenueOverview(), 2),
					queueRequest('revenue-breakdown', () => getRevenueBreakdown(), 2),

					// Lower priority - additional data
					queueRequest('total-guest', () => getTotalGuestData(), 1),
					queueRequest('bookings', () => getBookings(), 1),
				]);
			} catch (error) {
				console.error('Error loading dashboard data:', error);
			}
		};

		loadDashboardData();
	}, [
		queueRequest,
		getOverviewMetrics,
		getRevenueOverview,
		getRevenueBreakdown,
		getTotalGuestData,
		getBookings,
	]);

	// Show skeleton loading state
	if (overviewLoading) {
		return <OverviewSkeleton />;
	}

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
		</div>
	);
}
