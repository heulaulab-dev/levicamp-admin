'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RevenueChart } from '@/components/pages/overview/revenue-chart';
import { RevenueBreakdown } from '@/components/pages/overview/revenue-breakdown';
import { BookingList } from '@/components/pages/overview/booking-list';
import { DollarSign, Users, Tent, TrendingUp } from 'lucide-react';

export function Overview() {
	return (
		<div className='space-y-4'>
			<div className='gap-4 grid md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row justify-between items-center space-y-0 pb-2'>
						<CardTitle className='font-medium text-sm'>Total Revenue</CardTitle>
						<DollarSign className='w-4 h-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='font-bold text-2xl'>$45,231.89</div>
						<p className='text-muted-foreground text-xs'>
							+20.1% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row justify-between items-center space-y-0 pb-2'>
						<CardTitle className='font-medium text-sm'>Bookings</CardTitle>
						<Users className='w-4 h-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='font-bold text-2xl'>+573</div>
						<p className='text-muted-foreground text-xs'>
							+201 since last hour
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row justify-between items-center space-y-0 pb-2'>
						<CardTitle className='font-medium text-sm'>Active Tents</CardTitle>
						<Tent className='w-4 h-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='font-bold text-2xl'>24</div>
						<p className='text-muted-foreground text-xs'>+3 from yesterday</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row justify-between items-center space-y-0 pb-2'>
						<CardTitle className='font-medium text-sm'>Growth Rate</CardTitle>
						<TrendingUp className='w-4 h-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='font-bold text-2xl'>+12.5%</div>
						<p className='text-muted-foreground text-xs'>
							+2.1% from last month
						</p>
					</CardContent>
				</Card>
			</div>
			<div className='gap-4 grid md:grid-cols-2 lg:grid-cols-7'>
				<Card className='col-span-4'>
					<CardHeader>
						<CardTitle>Revenue Overview</CardTitle>
					</CardHeader>
					<CardContent className='pl-2'>
						<Tabs defaultValue='daily' className='space-y-4'>
							<TabsList>
								<TabsTrigger value='daily'>Daily</TabsTrigger>
								<TabsTrigger value='weekly'>Weekly</TabsTrigger>
								<TabsTrigger value='monthly'>Monthly</TabsTrigger>
							</TabsList>
							<TabsContent value='daily' className='space-y-4'>
								<RevenueChart />
							</TabsContent>
							<TabsContent value='weekly' className='space-y-4'>
								<RevenueChart />
							</TabsContent>
							<TabsContent value='monthly' className='space-y-4'>
								<RevenueChart />
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
				<Card className='col-span-3'>
					<CardHeader>
						<CardTitle>Revenue Breakdown</CardTitle>
					</CardHeader>
					<CardContent>
						<RevenueBreakdown />
					</CardContent>
				</Card>
			</div>
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
