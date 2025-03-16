'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw } from 'lucide-react';
import { baseColumns } from './base-columns';
import { successColumns } from './success-columns';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/common/PageHeader';
import { useRefunds } from '@/hooks/refunds/useRefunds';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function RefundManagement() {
	const { refunds, isLoading, fetchRefunds } = useRefunds();

	useEffect(() => {
		fetchRefunds();
	}, [fetchRefunds]);

	// Filter refunds based on status
	const pendingRefunds = refunds.filter(
		(refund) => refund.status === 'pending' || refund.status === 'approved',
	);
	const successfulRefunds = refunds.filter(
		(refund) => refund.status === 'completed',
	);

	const handleRefresh = () => {
		fetchRefunds();
	};

	if (isLoading) {
		return (
			<div className='space-y-4 mx-auto py-10 container'>
				<PageHeader
					title='Refund Management'
					subtitle='Manage and track guest refund request.'
				/>
				<Card>
					<CardHeader>
						<Skeleton className='w-[200px] h-8' />
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							<Skeleton className='w-full h-10' />
							<Skeleton className='w-full h-10' />
							<Skeleton className='w-full h-10' />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='mx-auto py-10 container'>
			<PageHeader title='Refund Management' />

			<Tabs defaultValue='pending' className='space-y-4'>
				<TabsList>
					<TabsTrigger value='pending' className='relative'>
						Pending Refunds
						<Badge
							variant='secondary'
							className='bg-orange-100 ml-2 text-orange-700'
						>
							{pendingRefunds.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value='successful'>
						Successful Refunds
						<Badge
							variant='secondary'
							className='bg-green-100 ml-2 text-green-700'
						>
							{successfulRefunds.length}
						</Badge>
					</TabsTrigger>
				</TabsList>

				<TabsContent value='pending'>
					<Card>
						<CardHeader>
							<CardTitle className='flex justify-between items-center'>
								<span>Pending Refund Requests</span>
								<Button
									variant='ghost'
									size='icon'
									onClick={handleRefresh}
									disabled={isLoading}
								>
									<RefreshCcw className='w-5 h-5 text-muted-foreground hover:text-primary transition-colors' />
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<DataTable data={pendingRefunds} columns={baseColumns} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='successful'>
					<Card>
						<CardHeader>
							<CardTitle className='flex justify-between items-center'>
								<span>Successful Refunds</span>
								<Button
									variant='ghost'
									size='icon'
									onClick={handleRefresh}
									disabled={isLoading}
								>
									<RefreshCcw className='w-5 h-5 text-muted-foreground hover:text-primary transition-colors' />
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<DataTable data={successfulRefunds} columns={successColumns} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
