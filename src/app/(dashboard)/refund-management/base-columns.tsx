import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Refund } from '@/types';
import { MoreHorizontal } from 'lucide-react';
import RefundDialogDrawer from '@/components/pages/refund-management/RefundDialogDrawer';
import UpdateStatusDialog from '@/components/pages/refund-management/UpdateStatusDialog';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

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
		id: 'actions',
		cell: ({ row }) => {
			const refund = row.original;
			return <ActionsDropdown refund={refund} />;
			// return (
			// 	<div className='flex gap-2'>
			// 		<RefundDialogDrawer refund={refund}>
			// 			<Button variant='outline' size='sm' className='p-0 w-8 h-8'>
			// 				<Eye className='w-4 h-4' />
			// 			</Button>
			// 		</RefundDialogDrawer>
			// 		{refund.status === 'pending' && (
			// 			<UpdateStatusDialog refund={refund}>
			// 				<Button size='sm'>Update Status</Button>
			// 			</UpdateStatusDialog>
			// 		)}
			// 	</div>
			// );
		},
	},
];

const ActionsDropdown = ({ refund }: { refund: Refund }) => {
	// const {
	// 	isDetailOpen,
	// 	setIsDetailOpen,
	// 	isUpdateStatusOpen,
	// 	setIsUpdateStatusOpen,
	// 	setSelectedRefund,
	// } = useRefundStore();

	// const handleViewDetailClick = () => {
	// 	setSelectedRefund(refund);
	// 	setIsDetailOpen(true);
	// };

	// const handleUpdateStatusClick = () => {
	// 	setSelectedRefund(refund);
	// 	setIsUpdateStatusOpen(true);
	// };
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' className='p-0 w-8 h-8'>
						<span className='sr-only'>Open menu</span>
						<MoreHorizontal className='w-4 h-4' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<RefundDialogDrawer refund={refund}>
						<DropdownMenuItem
							onSelect={(e) => {
								e.preventDefault();
								// handleViewDetailClick();
							}}
						>
							View Detail
						</DropdownMenuItem>
					</RefundDialogDrawer>
					{refund.status === 'pending' && (
						<UpdateStatusDialog refund={refund}>
							<DropdownMenuItem
								onSelect={(e) => {
									e.preventDefault();
									// handleUpdateStatusClick();
								}}
							>
								Update Status
							</DropdownMenuItem>
						</UpdateStatusDialog>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};