'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { RefreshCcw } from 'lucide-react';

import { Refund } from '@/types';
import { baseColumns } from './base-columns';
import { successColumns } from './success-columns';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/common/PageHeader';

// Mock data - Replace with actual data from your API
const pendingRefunds: Refund[] = [
	{
		id: 'REF001',
		guestName: 'John Doe',
		amount: 299.99,
		date: '2024-03-20',
		bookingId: 'BOOK-2024-001',
		reason: 'Unexpected cancellation',
		status: 'pending',
	},
	{
		id: 'REF002',
		guestName: 'Jane Smith',
		amount: 149.99,
		date: '2024-03-19',
		bookingId: 'BOOK-2024-002',
		reason: 'Change of plans',
		status: 'pending',
	},
];

const successfulRefunds: Refund[] = [
	{
		id: 'REF003',
		guestName: 'Alice Johnson',
		amount: 199.99,
		date: '2024-03-18',
		bookingId: 'BOOK-2024-003',
		reason: 'Service unavailable',
		status: 'completed',
		refundedDate: '2024-03-19',
		paymentProof: 'https://example.com/proof/ref003.pdf',
	},
	{
		id: 'REF004',
		guestName: 'Bob Wilson',
		amount: 399.99,
		date: '2024-03-17',
		bookingId: 'BOOK-2024-004',
		reason: 'Double booking',
		status: 'completed',
		refundedDate: '2024-03-18',
		paymentProof: 'https://example.com/proof/ref004.pdf',
	},
];

export default function RefundManagement() {
	return (
		<div className='mx-auto py-10 container'>
			<PageHeader
				title='Refund Management'
				subtitle='Manage and track guest refund request.'
			/>

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
								<RefreshCcw className='w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer' />
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
								<RefreshCcw className='w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer' />
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
