import { Checkbox } from '@/components/ui/checkbox';
import TableActions from '@/components/pages/booking-management/table-actions';

import { Badge } from '@/components/ui/badge';

import { Booking } from '@/types/booking';

import { ColumnDef } from '@tanstack/react-table';

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
		id: 'select',
		header: ({ table }) => (
			<div className='left-0 z-20 sticky'>
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && 'indeterminate')
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label='Select all'
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className='left-0 z-20 sticky'>
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label='Select row'
				/>
			</div>
		),
		size: 30,
		enableSorting: false,
	},
	{
		id: 'id',
		header: () => <div className='left-8 z-10 sticky'>Booking Code</div>,
		accessorKey: 'id',
		cell: ({ row }) => (
			<div className='left-8 z-10 sticky font-medium'>{row.getValue('id')}</div>
		),
	},

	{
		header: 'Guest',
		accessorKey: 'guest',
		cell: ({ row }) => (
			<div>
				<h1 className='font-medium'>{row.original.guest.name}</h1>
				<p className='text-muted-foreground text-sm'>
					{row.original.guest.phone}
				</p>
			</div>
		),
	},
	{
		header: 'Tent',
		accessorKey: 'tent',
		cell: ({ row }) => {
			const bookings = row.original.detail_booking;
			const tentNames = bookings.map((b) => b.reservation.tent.name);

			return (
				<div className='flex flex-wrap gap-1'>
					{tentNames.length > 0 ? (
						tentNames.map((name, index) => (
							<Badge key={index} className='text-xs'>
								{name}
							</Badge>
						))
					) : (
						<p className='text-muted-foreground text-sm'>No tent selected</p>
					)}
				</div>
			);
		},
	},
	{
		header: 'Total Amount',
		accessorKey: 'total_amount',
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('total_amount'));
			const formatted = new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
			}).format(amount);

			return <div className='text-muted-foreground'>{formatted}</div>;
		},
	},
	{
		header: 'Start Date',
		accessorKey: 'start_date',
		cell: ({ row }) => {
			const date = new Date(row.original.start_date);
			return (
				<div className='text-muted-foreground'>
					{date.toISOString().split('T')[0]}
				</div>
			);
		},
	},
	{
		header: 'End Date',
		accessorKey: 'end_date',
		cell: ({ row }) => {
			const date = new Date(row.original.end_date);
			return (
				<div className='text-muted-foreground'>
					{date.toISOString().split('T')[0]}
				</div>
			);
		},
	},
	{
		header: 'Created At',
		accessorKey: 'created_at',
		cell: ({ row }) => {
			const date = new Date(row.original.created_at);
			return (
				<div className='text-muted-foreground'>
					{date.toISOString().split('T')[0]}
				</div>
			);
		},
	},
	{
		header: 'Status',
		accessorKey: 'status',
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
		header: 'Actions',
		id: 'Actions',
		cell: ({ row }) => {
			const booking = row.original;
			return <TableActions booking={booking} />;
		},
	},
];
