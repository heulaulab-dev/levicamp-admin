'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

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
const chartData = [
	{ date: '2024-04-01', vip: 222, standard: 150 },
	{ date: '2024-04-02', vip: 97, standard: 180 },
	{ date: '2024-04-03', vip: 167, standard: 120 },
	{ date: '2024-04-04', vip: 242, standard: 260 },
	{ date: '2024-04-05', vip: 373, standard: 290 },
	{ date: '2024-04-06', vip: 301, standard: 340 },
	{ date: '2024-04-07', vip: 245, standard: 180 },
	{ date: '2024-04-08', vip: 409, standard: 320 },
	{ date: '2024-04-09', vip: 59, standard: 110 },
	{ date: '2024-04-10', vip: 261, standard: 190 },
	{ date: '2024-04-11', vip: 327, standard: 350 },
	{ date: '2024-04-12', vip: 292, standard: 210 },
	{ date: '2024-04-13', vip: 342, standard: 380 },
	{ date: '2024-04-14', vip: 137, standard: 220 },
	{ date: '2024-04-15', vip: 120, standard: 170 },
	{ date: '2024-04-16', vip: 138, standard: 190 },
	{ date: '2024-04-17', vip: 446, standard: 360 },
	{ date: '2024-04-18', vip: 364, standard: 410 },
	{ date: '2024-04-19', vip: 243, standard: 180 },
	{ date: '2024-04-20', vip: 89, standard: 150 },
	{ date: '2024-04-21', vip: 137, standard: 200 },
	{ date: '2024-04-22', vip: 224, standard: 170 },
	{ date: '2024-04-23', vip: 138, standard: 230 },
	{ date: '2024-04-24', vip: 387, standard: 290 },
	{ date: '2024-04-25', vip: 215, standard: 250 },
	{ date: '2024-04-26', vip: 75, standard: 130 },
	{ date: '2024-04-27', vip: 383, standard: 420 },
	{ date: '2024-04-28', vip: 122, standard: 180 },
	{ date: '2024-04-29', vip: 315, standard: 240 },
	{ date: '2024-04-30', vip: 454, standard: 380 },
	{ date: '2024-05-01', vip: 165, standard: 220 },
	{ date: '2024-05-02', vip: 293, standard: 310 },
	{ date: '2024-05-03', vip: 247, standard: 190 },
	{ date: '2024-05-04', vip: 385, standard: 420 },
	{ date: '2024-05-05', vip: 481, standard: 390 },
	{ date: '2024-05-06', vip: 498, standard: 520 },
	{ date: '2024-05-07', vip: 388, standard: 300 },
	{ date: '2024-05-08', vip: 149, standard: 210 },
	{ date: '2024-05-09', vip: 227, standard: 180 },
	{ date: '2024-05-10', vip: 293, standard: 330 },
	{ date: '2024-05-11', vip: 335, standard: 270 },
	{ date: '2024-05-12', vip: 197, standard: 240 },
	{ date: '2024-05-13', vip: 197, standard: 160 },
	{ date: '2024-05-14', vip: 448, standard: 490 },
	{ date: '2024-05-15', vip: 473, standard: 380 },
	{ date: '2024-05-16', vip: 338, standard: 400 },
	{ date: '2024-05-17', vip: 499, standard: 420 },
	{ date: '2024-05-18', vip: 315, standard: 350 },
	{ date: '2024-05-19', vip: 235, standard: 180 },
	{ date: '2024-05-20', vip: 177, standard: 230 },
	{ date: '2024-05-21', vip: 82, standard: 140 },
	{ date: '2024-05-22', vip: 81, standard: 120 },
	{ date: '2024-05-23', vip: 252, standard: 290 },
	{ date: '2024-05-24', vip: 294, standard: 220 },
	{ date: '2024-05-25', vip: 201, standard: 250 },
	{ date: '2024-05-26', vip: 213, standard: 170 },
	{ date: '2024-05-27', vip: 420, standard: 460 },
	{ date: '2024-05-28', vip: 233, standard: 190 },
	{ date: '2024-05-29', vip: 78, standard: 130 },
	{ date: '2024-05-30', vip: 340, standard: 280 },
	{ date: '2024-05-31', vip: 178, standard: 230 },
	{ date: '2024-06-01', vip: 178, standard: 200 },
	{ date: '2024-06-02', vip: 470, standard: 410 },
	{ date: '2024-06-03', vip: 103, standard: 160 },
	{ date: '2024-06-04', vip: 439, standard: 380 },
	{ date: '2024-06-05', vip: 88, standard: 140 },
	{ date: '2024-06-06', vip: 294, standard: 250 },
	{ date: '2024-06-07', vip: 323, standard: 370 },
	{ date: '2024-06-08', vip: 385, standard: 320 },
	{ date: '2024-06-09', vip: 438, standard: 480 },
	{ date: '2024-06-10', vip: 155, standard: 200 },
	{ date: '2024-06-11', vip: 92, standard: 150 },
	{ date: '2024-06-12', vip: 492, standard: 420 },
	{ date: '2024-06-13', vip: 81, standard: 130 },
	{ date: '2024-06-14', vip: 426, standard: 380 },
	{ date: '2024-06-15', vip: 307, standard: 350 },
	{ date: '2024-06-16', vip: 371, standard: 310 },
	{ date: '2024-06-17', vip: 475, standard: 520 },
	{ date: '2024-06-18', vip: 107, standard: 170 },
	{ date: '2024-06-19', vip: 341, standard: 290 },
	{ date: '2024-06-20', vip: 408, standard: 450 },
	{ date: '2024-06-21', vip: 169, standard: 210 },
	{ date: '2024-06-22', vip: 317, standard: 270 },
	{ date: '2024-06-23', vip: 480, standard: 530 },
	{ date: '2024-06-24', vip: 132, standard: 180 },
	{ date: '2024-06-25', vip: 141, standard: 190 },
	{ date: '2024-06-26', vip: 434, standard: 380 },
	{ date: '2024-06-27', vip: 448, standard: 490 },
	{ date: '2024-06-28', vip: 149, standard: 200 },
	{ date: '2024-06-29', vip: 103, standard: 160 },
	{ date: '2024-06-30', vip: 446, standard: 400 },
];

const chartConfig = {
	views: {
		label: 'Total Guest',
	},
	vip: {
		label: 'VIP',
		color: 'hsl(var(--chart-1))',
	},
	standard: {
		label: 'Standard',
		color: 'hsl(var(--chart-2))',
	},
} satisfies ChartConfig;

export function TotalGuestChart() {
	const [activeChart, setActiveChart] =
		React.useState<keyof typeof chartConfig>('vip');

	const total = React.useMemo(
		() => ({
			vip: chartData.reduce((acc, curr) => acc + curr.vip, 0),
			standard: chartData.reduce((acc, curr) => acc + curr.standard, 0),
		}),
		[],
	);

	return (
		<Card>
			<CardHeader className='flex sm:flex-row flex-col items-stretch space-y-0 p-0 border-b'>
				<div className='flex flex-col flex-1 justify-center gap-1 px-6 py-5 sm:py-6'>
					<CardTitle>Total Guest</CardTitle>
					<CardDescription>
						Showing total guest for the last 3 months based categories.
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
									{total[key as keyof typeof total].toLocaleString()}
								</span>
							</button>
						);
					})}
				</div>
			</CardHeader>
			<CardContent className='sm:p-6 px-2'>
				<ChartContainer
					config={chartConfig}
					className='w-full h-[250px] aspect-auto'
				>
					<BarChart
						accessibilityLayer
						data={chartData}
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
							content={
								<ChartTooltipContent
									className='w-[150px]'
									nameKey='views'
									labelFormatter={(value) => {
										return new Date(value).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric',
										});
									}}
								/>
							}
						/>
						<Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
