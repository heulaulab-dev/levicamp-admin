'use client';

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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
	useRevenueBreakdownStore,
	useBreakdownChartData,
} from '@/hooks/overview/useRevenueBreakdown';

import { useEffect, useRef } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

// Fallback data for when API returns null
const fallbackData = [{ name: 'No Data', value: 100, fill: 'var(--muted)' }];

const chartConfig = {
	guest: {
		label: 'Percentage',
	},
	VIP: {
		label: 'VIP',
		color: 'var(--chart-1)',
	},
	Standard: {
		label: 'Standard',
		color: ' var(--chart-2)',
	},
	AdditionalServices: {
		label: 'Additional Service',
		color: 'var(--chart-3)',
	},
} satisfies ChartConfig;

export function RevenueBreakdownChart() {
	// Get breakdown data and loading state from store
	const { getRevenueBreakdown, breakdownData, isLoading } =
		useRevenueBreakdownStore();
	const { categoryChartData, totalRevenue } = useBreakdownChartData();
	// Use ref to prevent duplicate API calls on mount
	const initialFetchDone = useRef(false);

	// Fetch data only once when component mounts
	useEffect(() => {
		if (!initialFetchDone.current) {
			console.log('Initial revenue breakdown mount - fetching data');
			initialFetchDone.current = true;
			getRevenueBreakdown();
		}
	}, [getRevenueBreakdown]);

	// Use actual data if available, fallback data otherwise
	const displayData =
		categoryChartData.length > 0 ? categoryChartData : fallbackData;

	// Get the current date for title display
	const currentDate = new Date();
	const dateDisplay = `${currentDate.toLocaleString('default', {
		month: 'long',
	})} ${currentDate.getFullYear()}`;

	// Show loading state
	if (isLoading) {
		return (
			<Card className='flex flex-col col-span-3'>
				<CardHeader className='items-center pb-0'>
					<Skeleton className='w-48 h-7' />
					<Skeleton className='mt-2 w-32 h-4' />
				</CardHeader>
				<CardContent className='flex flex-1 justify-center items-center pb-0'>
					<Skeleton className='rounded-full w-[250px] h-[250px]' />
				</CardContent>
				<CardFooter className='flex-col gap-2 pt-6 text-sm'>
					<Skeleton className='w-36 h-4' />
					<Skeleton className='w-48 h-4' />
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className='items-center pb-0'>
				<CardTitle>Revenue Breakdown</CardTitle>
				<CardDescription>{dateDisplay}</CardDescription>
			</CardHeader>
			<CardContent className='flex-1 justify-center pb-0'>
				<ChartContainer
					config={chartConfig}
					className='mx-auto max-h-[250px] aspect-square'
				>
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Pie
							data={displayData}
							dataKey='value'
							nameKey='name'
							innerRadius={60}
							strokeWidth={5}
						>
							<Label
								content={({ viewBox }) => {
									if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={viewBox.cy}
												textAnchor='middle'
												dominantBaseline='middle'
											>
												<tspan
													x={viewBox.cx}
													y={viewBox.cy}
													className='fill-foreground font-bold text-3xl'
												>
													{totalRevenue.toLocaleString()}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className='fill-muted-foreground'
												>
													Percentage
												</tspan>
											</text>
										);
									}
								}}
							/>
						</Pie>
					</PieChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className='flex-col gap-2 text-sm'>
				{breakdownData ? (
					<>
						<div className='flex items-center gap-2 font-medium leading-none'>
							Percentage by category analysis
						</div>
						<div className='text-muted-foreground leading-none'>
							Showing breakdown of percentage by category
						</div>
					</>
				) : (
					<div className='text-muted-foreground leading-none'>
						No revenue breakdown data available
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
