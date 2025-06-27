'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Booking } from '@/types/booking';
import { ResponsiveDialog } from '@/components/pages/overview/responsive-dialog';

const getStatusColor = (status: string) => {
	const colors = {
		pending: 'bg-yellow-100 text-yellow-800',
		confirmed: 'bg-blue-100 text-blue-800',
		checked_in: 'bg-green-100 text-green-800',
		completed: 'bg-purple-100 text-purple-800',
		canceled: 'bg-red-100 text-red-800',
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
		cell: ({ row }) => {
			return <div className='font-medium'>{row.original.id.split('-')[0]}</div>;
		},
	},
	{
		accessorKey: 'date_range',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Date Range' />
		),
		cell: ({ row }) => {
			const booking = row.original;
			return (
				<div>
					{new Date(booking.start_date).toLocaleDateString()}
					<br />
					{new Date(booking.end_date).toLocaleDateString()}
				</div>
			);
		},
	},
	{
		accessorKey: 'tent',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Tent Details' />
		),
		cell: ({ row }) => {
			const booking = row.original;
			return (
				<div>
					<div className='font-medium'>
						{booking.detail_booking?.[0]?.reservation?.tent?.name || 'N/A'}
					</div>
					<div className='text-muted-foreground text-sm'>
						{booking.detail_booking?.[0]?.reservation?.tent?.category?.name ||
							'N/A'}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: 'guest',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Guest Information' />
		),
		cell: ({ row }) => {
			const booking = row.original;
			return (
				<div>
					<div className='font-medium'>{booking.guest?.name || 'N/A'}</div>
					<div className='text-muted-foreground text-sm'>
						{booking.guest?.phone || 'N/A'}
					</div>
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
				<Badge variant='secondary' className={getStatusColor(status)}>
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
						{booking.status === 'confirmed' ? (
							<ResponsiveDialog booking={booking} type='checkin'>
								<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
									Check-in Guest
								</DropdownMenuItem>
							</ResponsiveDialog>
						) : (
							<DropdownMenuItem disabled onSelect={(e) => e.preventDefault()}>
								Check-in Guest (Requires Confirmed Status)
							</DropdownMenuItem>
						)}
						<ResponsiveDialog booking={booking} type='modify'>
							<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
								Modify Booking
							</DropdownMenuItem>
						</ResponsiveDialog>
						<ResponsiveDialog booking={booking} type='cancel'>
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className='text-red-600'
							>
								Cancel Booking
							</DropdownMenuItem>
						</ResponsiveDialog>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
