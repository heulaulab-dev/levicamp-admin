'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/types/booking';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal } from 'lucide-react';
import { BookingDetailsModal } from '@/components/pages/booking-management/booking-details-modal';
import { BookingActionDialog } from '@/components/pages/booking-management/booking-action-dialog';

const getStatusColor = (status: string) => {
	const colors = {
		pending: 'bg-yellow-100 text-yellow-800',
		confirmed: 'bg-blue-100 text-blue-800',
		checked_in: 'bg-green-100 text-green-800',
		completed: 'bg-purple-100 text-purple-800',
		cancelled: 'bg-red-100 text-red-800',
		refund: 'bg-orange-100 text-orange-800',
		rescheduled: 'bg-indigo-100 text-indigo-800',
	};
	return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const columns: ColumnDef<Booking>[] = [
	{
		accessorKey: 'id',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Booking ID' />
		),
	},
	{
		accessorKey: 'guest.name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Guest Name' />
		),
	},
	{
		accessorKey: 'total_amount',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Total Amount' />
		),
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('total_amount'));
			const formatted = new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
			}).format(amount);

			return <div className='font-medium'>{formatted}</div>;
		},
	},
	{
		accessorKey: 'start_date',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Start Date' />
		),
		cell: ({ row }) => {
			return (
				<div className='font-medium'>
					{new Date(row.getValue('start_date')).toLocaleDateString()}
				</div>
			);
		},
	},
	{
		accessorKey: 'end_date',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='End Date' />
		),
		cell: ({ row }) => {
			return (
				<div className='font-medium'>
					{new Date(row.getValue('end_date')).toLocaleDateString()}
				</div>
			);
		},
	},
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Status' />
		),
		cell: ({ row }) => {
			const status = row.getValue('status') as string;
			return (
				<Badge className={getStatusColor(status)}>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</Badge>
			);
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const booking = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' className='p-0 w-8 h-8'>
							<span className='sr-only'>Open menu</span>
							<MoreHorizontal className='w-4 h-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<BookingDetailsModal booking={booking}>
							<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
								<Eye className='mr-2 w-4 h-4' />
								View Details
							</DropdownMenuItem>
						</BookingDetailsModal>
						<DropdownMenuSeparator />
						{booking.status === 'confirmed' && (
							<BookingActionDialog booking={booking} type='checkin'>
								<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
									Check-in Guest
								</DropdownMenuItem>
							</BookingActionDialog>
						)}
						{booking.status === 'checked_in' && (
							<BookingActionDialog booking={booking} type='checkout'>
								<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
									Check-out Guest
								</DropdownMenuItem>
							</BookingActionDialog>
						)}
						<BookingActionDialog booking={booking} type='modify'>
							<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
								Modify Booking
							</DropdownMenuItem>
						</BookingActionDialog>
						<BookingActionDialog booking={booking} type='cancel'>
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className='text-red-600'
							>
								Cancel Booking
							</DropdownMenuItem>
						</BookingActionDialog>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
