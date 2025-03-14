'use client';

import { useState } from 'react';
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

// Sample data for each format
const dailyData = [
	{ date: '2025-03-01', revenue: 2500.0 },
	{ date: '2025-03-02', revenue: 1800.5 },
	{ date: '2025-03-03', revenue: 3200.75 },
	{ date: '2025-03-04', revenue: 2700.25 },
	{ date: '2025-03-05', revenue: 3100.0 },
	{ date: '2025-03-06', revenue: 2900.5 },
];

const monthlyData = [
	{ date: '2024-01', revenue: 42500.0 },
	{ date: '2024-02', revenue: 38700.5 },
	{ date: '2024-03', revenue: 45200.75 },
	{ date: '2024-04', revenue: 39800.25 },
	{ date: '2024-05', revenue: 47100.0 },
	{ date: '2024-06', revenue: 51900.5 },
];

const yearlyData = [
	{ date: '2020', revenue: 325000.0 },
	{ date: '2021', revenue: 418000.5 },
	{ date: '2022', revenue: 492000.75 },
	{ date: '2023', revenue: 537000.25 },
	{ date: '2024', revenue: 621000.0 },
	{ date: '2025', revenue: 320000.5 }, // Partial year
];

const chartConfig = {
	revenue: {
		label: 'Revenue',
		color: 'hsl(var(--chart-1))',
	},
} satisfies ChartConfig;

export function RevenueChart() {
	const [dateFormat, setDateFormat] = useState('daily');

	// Select data based on format
	const getData = () => {
		switch (dateFormat) {
			case 'daily':
				return dailyData;
			case 'monthly':
				return monthlyData;
			case 'yearly':
				return yearlyData;
			default:
				return dailyData;
		}
	};

	// Format date for display based on format
	const formatDate = (date: string) => {
		switch (dateFormat) {
			case 'daily':
				// Format: 2025-03-01 -> Mar 1
				return new Date(date).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
				});
			case 'monthly':
				// Format: 2024-01 -> Jan 2024
				const [year, month] = date.split('-');
				return (
					new Date(`${year}-${month}-01`).toLocaleDateString('en-US', {
						month: 'short',
					}) +
					' ' +
					year
				);
			case 'yearly':
				// Format: Just the year
				return date;
			default:
				return date;
		}
	};

	// Get title based on format
	const getTitle = () => {
		switch (dateFormat) {
			case 'daily':
				return 'Daily Revenue (March 2025)';
			case 'monthly':
				return 'Monthly Revenue (2025)';
			case 'yearly':
				return 'Yearly Revenue (2020-2025)';
			default:
				return 'Revenue';
		}
	};

	// Calculate trend percentage
	const calculateTrend = () => {
		const data = getData();
		if (data.length < 2) return { percentage: 0, isUp: true };

		const current = data[data.length - 1].revenue;
		const previous = data[data.length - 2].revenue;
		const percentage = (((current - previous) / previous) * 100).toFixed(1);

		return {
			percentage: Math.abs(Number(percentage)),
			isUp: Number(percentage) >= 0,
		};
	};

	const trend = calculateTrend();

	return (
		<Card className='col-span-4'>
			<CardHeader>
				<div className='flex justify-between items-center'>
					<div>
						<CardTitle>{getTitle()}</CardTitle>
						<CardDescription>Revenue performance</CardDescription>
					</div>
					<Select value={dateFormat} onValueChange={setDateFormat}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Select format' />
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
				<ChartContainer config={chartConfig}>
					<LineChart
						accessibilityLayer
						data={getData()}
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
							tickFormatter={(value) => formatDate(value)}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									hideLabel
									formatter={(value) =>
										`$${Number(value).toLocaleString('en-US', {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}`
									}
									labelFormatter={(label) => formatDate(label)}
								/>
							}
						/>
						<Line
							dataKey='revenue'
							type='natural'
							stroke='var(--color-revenue)'
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className='flex-col items-start gap-2 text-sm'>
				<div className='flex gap-2 font-medium leading-none'>
					{trend.isUp ? (
						<>
							Trending up by {trend.percentage}%{' '}
							{trend.isUp && <TrendingUp className='w-4 h-4 text-green-500' />}
						</>
					) : (
						<>
							Trending down by {trend.percentage}%{' '}
							{!trend.isUp && <TrendingDown className='w-4 h-4 text-red-500' />}
						</>
					)}
				</div>
				<div className='text-muted-foreground leading-none'>
					Showing {dateFormat} revenue data
				</div>
			</CardFooter>
		</Card>
	);
}
