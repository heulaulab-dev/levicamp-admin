import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Refund } from '@/types';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

export const successColumns: ColumnDef<Refund>[] = [
	{
		accessorKey: 'id',
		header: 'Request ID',
	},
	{
		accessorKey: 'guestName',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Guest Name' />
		),
	},
	{
		accessorKey: 'bookingId',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Booking ID' />
		),
	},
	{
		accessorKey: 'amount',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Amount' />
		),
		cell: ({ row }) =>
			new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
			}).format(row.original.amount),
	},
	{
		accessorKey: 'reason',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Reason' />
		),
	},
	{
		accessorKey: 'date',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Request Date' />
		),
	},
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Status' />
		),
		cell: ({ row }) => {
			const status = row.original.status.toLowerCase();
			const statusColor =
				status === 'pending'
					? 'destructive'
					: status === 'completed'
					? 'success'
					: status === 'processing'
					? 'secondary'
					: 'default';
			return <Badge variant={statusColor}>{status}</Badge>;
		},
	},
	{
		accessorKey: 'refundedDate',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Completion Date' />
		),
	},
	{
		accessorKey: 'paymentProof',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Payment Proof' />
		),
		cell: ({ row }) => {
			const paymentProof = row.original.paymentProof;
			return (
				<Button
					variant='outline'
					size='sm'
					className='p-0 w-8 h-8'
					onClick={() => window.open(paymentProof, '_blank')}
				>
					<Download className='w-4 h-4' />
				</Button>
			);
		},
	},
];
