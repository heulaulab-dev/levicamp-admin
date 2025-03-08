import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Refund } from '@/types';
import { Eye } from 'lucide-react';
import RefundDialogDrawer from '@/components/pages/refund-management/RefundDialogDrawer';
import UpdateStatusDialog from '@/components/pages/refund-management/UpdateStatusDialog';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

export const baseColumns: ColumnDef<Refund>[] = [
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
		id: 'actions',
		cell: ({ row }) => {
			const refund = row.original;
			return (
				<div className='flex gap-2'>
					<RefundDialogDrawer refund={refund}>
						<Button variant='outline' size='sm' className='p-0 w-8 h-8'>
							<Eye className='w-4 h-4' />
						</Button>
					</RefundDialogDrawer>
					{refund.status === 'pending' && (
						<UpdateStatusDialog refund={refund}>
							<Button size='sm'>Update Status</Button>
						</UpdateStatusDialog>
					)}
				</div>
			);
		},
	},
];
