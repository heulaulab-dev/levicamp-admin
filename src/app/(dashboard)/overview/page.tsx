'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingList } from '@/components/pages/overview/booking-list';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { OverviewCard } from '@/components/pages/overview/OverviewCard';
import { TotalGuestChart } from '@/components/pages/overview/TotalGuestChart';
import { RevenueChart } from '@/components/pages/overview/RevenueOverview';
import { RevenueBreakdown } from '@/components/pages/overview/RevenueBreakdown';
import { useOverviewStore } from '@/hooks/overview/useOverview';
import { Skeleton } from '@/components/ui/skeleton';

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
	// Use the overview store instead of hardcoded data
	const {
		getOverviewMetrics,
		isLoading,
		error,
		activeTents,
		growthRate,
		totalBookings,
		totalRevenue,
	} = useOverviewStore();

	// Fetch metrics when component mounts
	useEffect(() => {
		getOverviewMetrics();
	}, [getOverviewMetrics]);

	// Show skeleton loading state
	if (isLoading) {
		return <OverviewSkeleton />;
	}

	// Show error state
	if (error) {
		return (
			<div className='bg-red-50 p-4 border border-red-300 rounded-md'>
				<h3 className='font-semibold text-red-700'>Error loading metrics</h3>
				<p className='text-red-600'>{error}</p>
			</div>
		);
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
