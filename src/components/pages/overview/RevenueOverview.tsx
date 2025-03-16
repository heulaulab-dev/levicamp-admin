'use client';

import { useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
	useRevenueOverviewStore,
	useRevenueChartData,
} from '@/hooks/overview/useRevenueOverview';
import { RevenuePeriod } from '@/types/revenue';

// Fallback data if API returns nothing
const fallbackData = [
	{ date: new Date().toISOString().split('T')[0], amount: 0 },
];

const chartConfig = {
	revenue: {
		label: 'Revenue',
		color: 'hsl(var(--chart-1))',
	},
} satisfies ChartConfig;

export function RevenueChart() {
	// Get revenue data and controls from our store
	const {
		getRevenueOverview,
		setPeriod,
		period,
		isLoading,
		error,
		revenueData,
	} = useRevenueOverviewStore();
	const { chartData } = useRevenueChartData();

	// Use ref to prevent duplicate API calls on mount
	const initialFetchDone = useRef(false);

	// Fetch data only once when component mounts
	useEffect(() => {
		if (!initialFetchDone.current) {
			console.log('Initial revenue chart mount - fetching data');
			initialFetchDone.current = true;
			// Only fetch if we don't already have data
			if (revenueData.length === 0) {
				getRevenueOverview();
			}
		}
	}, [getRevenueOverview, revenueData.length]);

	// Handle period change
	const handlePeriodChange = (value: string) => {
		// Only call setPeriod if the period has actually changed
		if (value !== period) {
			console.log(`Changing revenue period from ${period} to ${value}`);
			setPeriod(value as RevenuePeriod);
		}
	};

	// Get title based on period
	const getTitle = () => {
		switch (period) {
			case 'daily':
				return 'Daily Revenue';
			case 'monthly':
				return 'Monthly Revenue';
			case 'yearly':
				return 'Yearly Revenue';
			default:
				return 'Revenue Overview';
		}
	};

	// Calculate trend percentage (if at least 2 data points)
	const calculateTrend = () => {
		if (chartData.length < 2) return { percentage: 0, isUp: true };

		const current = chartData[chartData.length - 1].amount;
		const previous = chartData[chartData.length - 2].amount;

		// Avoid division by zero
		if (previous === 0) return { percentage: 0, isUp: current > 0 };

		const percentage = (((current - previous) / previous) * 100).toFixed(1);

		return {
			percentage: Math.abs(Number(percentage)),
			isUp: Number(percentage) >= 0,
		};
	};

	const trend = calculateTrend();

	// Show skeleton loading state
	if (isLoading) {
		return (
			<Card className='col-span-4'>
				<CardHeader>
					<div className='flex justify-between items-center'>
						<div>
							<Skeleton className='mb-2 w-48 h-6' />
							<Skeleton className='w-32 h-4' />
						</div>
						<Skeleton className='w-[180px] h-10' />
					</div>
				</CardHeader>
				<CardContent>
					<Skeleton className='w-full h-[250px]' />
				</CardContent>
				<CardFooter>
					<Skeleton className='w-48 h-4' />
				</CardFooter>
			</Card>
		);
	}

	// Show error state if there's an error
	if (error) {
		return (
			<Card className='col-span-4'>
				<CardContent className='p-4'>
					<div className='bg-red-50 p-4 border border-red-300 rounded-md'>
						<h3 className='font-semibold text-red-700'>
							Error loading revenue data
						</h3>
						<p className='text-red-600'>{error}</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Use empty data display when no data is available
	const displayData = chartData.length > 0 ? chartData : fallbackData;

	return (
		<Card className='col-span-4'>
			<CardHeader>
				<div className='flex justify-between items-center'>
					<div>
						<CardTitle>{getTitle()}</CardTitle>
						<CardDescription>Revenue performance</CardDescription>
					</div>
					<Select value={period} onValueChange={handlePeriodChange}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Select period' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='daily'>Daily</SelectItem>
							<SelectItem value='monthly'>Monthly</SelectItem>
							<SelectItem value='yearly'>Yearly</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{chartData.length === 0 ? (
					<div className='flex justify-center items-center h-[250px]'>
						<p className='text-muted-foreground'>No revenue data available</p>
					</div>
				) : (
					<ChartContainer config={chartConfig}>
						<LineChart
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
								tickFormatter={(value) => value}
							/>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										hideLabel
										formatter={(value) =>
											`Rp.${Number(value).toLocaleString('id-ID')}`
										}
									/>
								}
							/>
							<Line
								dataKey='amount'
								type='natural'
								stroke='var(--color-revenue)'
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ChartContainer>
				)}
			</CardContent>
			<CardFooter className='flex-col items-start gap-2 text-sm'>
				<div className='flex gap-2 font-medium leading-none'>
					{chartData.length > 0 ? (
						trend.isUp ? (
							<>
								Trending up by {trend.percentage}%{' '}
								<TrendingUp className='w-4 h-4 text-green-500' />
							</>
						) : (
							<>
								Trending down by {trend.percentage}%{' '}
								<TrendingDown className='w-4 h-4 text-red-500' />
							</>
						)
					) : (
						<>No trend data available</>
					)}
				</div>
				<div className='text-muted-foreground leading-none'>
					Showing {period} revenue data
				</div>
			</CardFooter>
		</Card>
	);
}
