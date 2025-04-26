'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';
import {
	useTotalGuestStore,
	useGuestChartData,
} from '@/hooks/overview/useTotalGuest';

const chartConfig = {
	views: {
		label: 'Total Guest',
	},
	vip: {
		label: 'VIP',
		color: 'var(--chart-1)',
	},
	standard: {
		label: 'Standard',
		color: 'var(--chart-2)',
	},
} satisfies ChartConfig;

// Fallback data to maintain UI when the API returns null
const fallbackGuestData = [
	{ date: new Date().toISOString().split('T')[0], vip: 0, standard: 0 },
];

export function TotalGuestChart() {
	// Get guest data and loading state from store
	const { getTotalGuestData, guestData, isLoading } = useTotalGuestStore();
	const [activeChart, setActiveChart] =
		React.useState<keyof typeof chartConfig>('vip');

	// Use ref to prevent duplicate API calls on mount
	const initialFetchDone = useRef(false);

	// Fetch data only once when component mounts
	useEffect(() => {
		if (!initialFetchDone.current) {
			console.log('Initial total guest chart mount - fetching data');
			initialFetchDone.current = true;
			// Only fetch if we don't already have data
			if (guestData.length === 0) {
				getTotalGuestData();
			}
		}
	}, [getTotalGuestData, guestData.length]);

	// Use helper hook to process the data for the chart - only use what we need
	const { totalVipGuests, totalStandardGuests } = useGuestChartData();

	// Calculate totals for display
	const totals = {
		vip: totalVipGuests,
		standard: totalStandardGuests,
	};

	// Show loading state while fetching data
	if (isLoading) {
		return (
			<Card>
				<CardContent className='flex justify-center items-center h-[300px]'>
					<Loader2 className='w-8 h-8 text-primary animate-spin' />
					<span className='ml-2'>Loading guest data...</span>
				</CardContent>
			</Card>
		);
	}

	// Data to use for rendering - use actual data if available, fallback otherwise
	// This ensures the chart UI is maintained even with null/empty data
	const displayData =
		guestData && guestData.length > 0 ? guestData : fallbackGuestData;

	return (
		<Card>
			<CardHeader className='flex sm:flex-row flex-col items-stretch space-y-0 p-0 border-b'>
				<div className='flex flex-col flex-1 justify-center gap-1 px-6 py-5 sm:py-6'>
					<CardTitle>Total Guest</CardTitle>
					<CardDescription>
						Showing total guest data based on categories.
					</CardDescription>
				</div>
				<div className='flex'>
					{['vip', 'standard'].map((key) => {
						const chart = key as keyof typeof chartConfig;
						return (
							<button
								key={chart}
								data-active={activeChart === chart}
								className='z-30 relative flex flex-col flex-1 justify-center gap-1 data-[active=true]:bg-muted/50 px-6 sm:px-8 py-4 sm:py-6 border-t sm:border-t-0 sm:border-l even:border-l text-left'
								onClick={() => setActiveChart(chart)}
							>
								<span className='text-muted-foreground text-xs'>
									{chartConfig[chart].label}
								</span>
								<span className='font-bold text-lg sm:text-3xl leading-none'>
									{totals[key as keyof typeof totals].toLocaleString()}
								</span>
							</button>
						);
					})}
				</div>
			</CardHeader>
			<CardContent className='sm:p-6 px-2'>
				{!guestData.length && (
					<div className='flex justify-center items-center h-[250px]'>
						<p className='text-muted-foreground'>No guest data available</p>
					</div>
				)}
				{guestData.length > 0 && (
					<ChartContainer
						config={chartConfig}
						className='w-full h-[250px] aspect-auto'
					>
						<BarChart
							accessibilityLayer
							data={displayData}
							margin={{
								left: 12,
								right: 12,
							}}
						>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey='date'
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={32}
								tickFormatter={(value) => {
									const date = new Date(value);
									return date.toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
									});
								}}
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent hideLabel />}
							/>
							<Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
