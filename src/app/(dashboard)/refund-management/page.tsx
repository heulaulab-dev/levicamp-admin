'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw } from 'lucide-react';
import {
	allColumns,
	pendingColumns,
	processingColumns,
	rejectedColumns,
	successColumns,
} from '@/components/pages/refund-management/refund-columns';
import { PageHeader } from '@/components/common/page-header';
import { useRefunds } from '@/hooks/refunds/use-refunds';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefundStatus } from '@/types/refund';
import { useExport } from '@/hooks/export/use-export';
import { toast } from 'sonner';
import RefundTable from '@/components/pages/refund-management/refund-table';

export default function RefundManagement() {
	const { refunds, isLoading, getRefunds, pendingNotificationRefund } =
		useRefunds();
	const [activeTab, setActiveTab] = useState<'all' | RefundStatus>('all');
	const [initialDataLoaded, setInitialDataLoaded] = useState(false);
	const { exportRefunds } = useExport();

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

	const handleExport = () => {
		const promise = () => {
			return exportRefunds();
		};

		toast.promise(promise, {
			loading: 'Exporting refund data...',
			success: () => {
				return 'Refunds exported successfully';
			},
			error: 'Failed to export refunds',
		});
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
						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='icon'
								onClick={handleRefresh}
								disabled={isLoading}
								className='w-9 h-9'
							>
								<RefreshCw
									className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
								/>
								<span className='sr-only'>Refresh data</span>
							</Button>
							<Button onClick={handleExport} disabled={isLoading}>
								<Download className='mr-2 w-4 h-4' />
								Export Data
							</Button>
						</div>
					</div>
					<RefundTable data={refunds} columns={allColumns} />
				</TabsContent>

				<TabsContent value='pending'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-semibold text-lg'>Pending Refund Requests</h3>
						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='icon'
								onClick={handleRefresh}
								disabled={isLoading}
								className='w-9 h-9'
							>
								<RefreshCw
									className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
								/>
								<span className='sr-only'>Refresh data</span>
							</Button>
							<Button onClick={handleExport} disabled={isLoading}>
								<Download className='mr-2 w-4 h-4' />
								Export Data
							</Button>
						</div>
					</div>
					<RefundTable data={pendingRefunds} columns={pendingColumns} />
				</TabsContent>

				<TabsContent value='processing'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-semibold text-lg'>
							Processing Refund Requests
						</h3>
						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='icon'
								onClick={handleRefresh}
								disabled={isLoading}
								className='w-9 h-9'
							>
								<RefreshCw
									className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
								/>
								<span className='sr-only'>Refresh data</span>
							</Button>
							<Button onClick={handleExport} disabled={isLoading}>
								<Download className='mr-2 w-4 h-4' />
								Export Data
							</Button>
						</div>
					</div>
					<RefundTable data={processingRefunds} columns={processingColumns} />
				</TabsContent>

				<TabsContent value='rejected'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-semibold text-lg'>Rejected Refund Requests</h3>
						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='icon'
								onClick={handleRefresh}
								disabled={isLoading}
								className='w-9 h-9'
							>
								<RefreshCw
									className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
								/>
								<span className='sr-only'>Refresh data</span>
							</Button>
							<Button onClick={handleExport} disabled={isLoading}>
								<Download className='mr-2 w-4 h-4' />
								Export Data
							</Button>
						</div>
					</div>
					<RefundTable data={rejectedRefunds} columns={rejectedColumns} />
				</TabsContent>

				<TabsContent value='success'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-semibold text-lg'>Successful Refunds</h3>
						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='icon'
								onClick={handleRefresh}
								disabled={isLoading}
								className='w-9 h-9'
							>
								<RefreshCw
									className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
								/>
								<span className='sr-only'>Refresh data</span>
							</Button>
							<Button onClick={handleExport} disabled={isLoading}>
								<Download className='mr-2 w-4 h-4' />
								Export Data
							</Button>
						</div>
					</div>
					<RefundTable data={successRefunds} columns={successColumns} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

