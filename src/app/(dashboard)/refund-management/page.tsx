'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw } from 'lucide-react';
import {
	allColumns,
	pendingColumns,
	processingColumns,
	rejectedColumns,
	successColumns,
} from './columns';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/common/PageHeader';
import { useRefunds } from '@/hooks/refunds/useRefunds';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefundStatus } from '@/types/refund';

export default function RefundManagement() {
	const { refunds, isLoading, getRefunds, pendingNotificationRefund } =
		useRefunds();
	const [activeTab, setActiveTab] = useState<'all' | RefundStatus>('all');
	const [initialDataLoaded, setInitialDataLoaded] = useState(false);

	useEffect(() => {
		// Load all refunds only once on component mount
		if (!initialDataLoaded) {
			getRefunds();
			pendingNotificationRefund();
			setInitialDataLoaded(true);
		}
	}, [getRefunds, pendingNotificationRefund, initialDataLoaded]);

	// Filter refunds based on status
	const pendingRefunds = refunds.filter(
		(refund) => refund.status === 'pending',
	);
	const processingRefunds = refunds.filter(
		(refund) => refund.status === 'processing',
	);
	const rejectedRefunds = refunds.filter(
		(refund) => refund.status === 'rejected',
	);
	const successRefunds = refunds.filter(
		(refund) => refund.status === 'success',
	);

	const handleRefresh = () => {
		getRefunds();
		pendingNotificationRefund();
	};

	// Updated to not reload data when switching tabs
	const handleTabChange = (value: string) => {
		setActiveTab(value as 'all' | RefundStatus);
		// No API calls here, just switching the tab view
	};

	// Only show skeleton on initial load, not during refreshes
	if (isLoading && !initialDataLoaded) {
		return (
			<div className='space-y-4 mx-auto py-10 container'>
				<PageHeader title='Refund Management' />
				<div className='p-4 border rounded-lg'>
					<div className='pb-4 border-b'>
						<Skeleton className='w-[200px] h-8' />
					</div>
					<div className='py-4'>
						<div className='space-y-2'>
							<Skeleton className='w-full h-10' />
							<Skeleton className='w-full h-10' />
							<Skeleton className='w-full h-10' />
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='mx-auto py-10 container'>
			<PageHeader title='Refund Management' />

			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				className='space-y-4'
			>
				<TabsList className='bg-transparent p-0 border-b border-border rounded-none h-auto'>
					<TabsTrigger
						value='all'
						className='after:bottom-0 after:absolute relative after:inset-x-0 data-[state=active]:after:bg-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2 rounded-none after:h-0.5'
					>
						All Refunds
						<Badge variant='secondary' className='ml-2'>
							{refunds.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value='pending'
						className='after:bottom-0 after:absolute relative after:inset-x-0 data-[state=active]:after:bg-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2 rounded-none after:h-0.5'
					>
						Pending
						<Badge
							variant='secondary'
							className='bg-orange-100 ml-2 text-orange-700'
						>
							{pendingRefunds.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value='processing'
						className='after:bottom-0 after:absolute relative after:inset-x-0 data-[state=active]:after:bg-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2 rounded-none after:h-0.5'
					>
						Processing
						<Badge
							variant='secondary'
							className='bg-blue-100 ml-2 text-blue-700'
						>
							{processingRefunds.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value='rejected'
						className='after:bottom-0 after:absolute relative after:inset-x-0 data-[state=active]:after:bg-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2 rounded-none after:h-0.5'
					>
						Rejected
						<Badge variant='secondary' className='bg-red-100 ml-2 text-red-700'>
							{rejectedRefunds.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value='success'
						className='after:bottom-0 after:absolute relative after:inset-x-0 data-[state=active]:after:bg-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2 rounded-none after:h-0.5'
					>
						Success
						<Badge
							variant='secondary'
							className='bg-green-100 ml-2 text-green-700'
						>
							{successRefunds.length}
						</Badge>
					</TabsTrigger>
				</TabsList>

				<TabsContent value='all'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-semibold text-lg'>All Refund Requests</h3>
						<Button
							variant='ghost'
							size='icon'
							onClick={handleRefresh}
							disabled={isLoading}
						>
							<RefreshCcw
								className={`w-5 h-5 ${
									isLoading
										? 'animate-spin text-primary'
										: 'text-muted-foreground hover:text-primary'
								} transition-colors`}
							/>
						</Button>
					</div>
					<DataTable data={refunds} columns={allColumns} />
				</TabsContent>

				<TabsContent value='pending'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-semibold text-lg'>Pending Refund Requests</h3>
						<Button
							variant='ghost'
							size='icon'
							onClick={handleRefresh}
							disabled={isLoading}
						>
							<RefreshCcw
								className={`w-5 h-5 ${
									isLoading
										? 'animate-spin text-primary'
										: 'text-muted-foreground hover:text-primary'
								} transition-colors`}
							/>
						</Button>
					</div>
					<DataTable data={pendingRefunds} columns={pendingColumns} />
				</TabsContent>

				<TabsContent value='processing'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-semibold text-lg'>
							Processing Refund Requests
						</h3>
						<Button
							variant='ghost'
							size='icon'
							onClick={handleRefresh}
							disabled={isLoading}
						>
							<RefreshCcw
								className={`w-5 h-5 ${
									isLoading
										? 'animate-spin text-primary'
										: 'text-muted-foreground hover:text-primary'
								} transition-colors`}
							/>
						</Button>
					</div>
					<DataTable data={processingRefunds} columns={processingColumns} />
				</TabsContent>

				<TabsContent value='rejected'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-semibold text-lg'>Rejected Refund Requests</h3>
						<Button
							variant='ghost'
							size='icon'
							onClick={handleRefresh}
							disabled={isLoading}
						>
							<RefreshCcw
								className={`w-5 h-5 ${
									isLoading
										? 'animate-spin text-primary'
										: 'text-muted-foreground hover:text-primary'
								} transition-colors`}
							/>
						</Button>
					</div>
					<DataTable data={rejectedRefunds} columns={rejectedColumns} />
				</TabsContent>

				<TabsContent value='success'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-semibold text-lg'>Successful Refunds</h3>
						<Button
							variant='ghost'
							size='icon'
							onClick={handleRefresh}
							disabled={isLoading}
						>
							<RefreshCcw
								className={`w-5 h-5 ${
									isLoading
										? 'animate-spin text-primary'
										: 'text-muted-foreground hover:text-primary'
								} transition-colors`}
							/>
						</Button>
					</div>
					<DataTable data={successRefunds} columns={successColumns} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
