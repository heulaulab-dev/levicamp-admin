'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Tent } from '@/types/tent';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditTentForm } from '@/components/pages/tent-management/tents/EditTentForm';
import { DeleteTentDialog } from '@/components/pages/tent-management/tents/DeleteTentDialog';
import { useTentStore } from '@/hooks/tents/useTents';
import { memo, useCallback, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<Tent>[] = [
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
		accessorKey: 'name',
		header: 'Tent Name',
	},
	{
		accessorKey: 'category',
		header: 'Category',
		cell: ({ row }) => {
			const category = row.original.category;
			return <Badge>{category.name}</Badge>;
		},
	},
	{
		accessorKey: 'weekday_price',
		header: 'Weekday Price',
		cell: ({ row }) =>
			new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
			}).format(row.original.weekday_price),
	},
	{
		accessorKey: 'weekend_price',
		header: 'Weekend Price',
		cell: ({ row }) =>
			new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
			}).format(row.original.weekend_price),
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.original.status.toLowerCase();
			const statusColor =
				status === 'available'
					? 'success'
					: status === 'unavailable'
					? 'destructive'
					: status === 'maintenance'
					? 'destructive'
					: 'default';

			return <Badge variant={statusColor}>{status}</Badge>;
		},
	},
	{
		accessorKey: 'facilities',
		header: 'Facilities',
		cell: ({ row }) => {
			const facilities = Array.isArray(row.original.facilities)
				? row.original.facilities
				: [];

			if (facilities.length === 0)
				return <span className='text-gray-500'>-</span>;

			return (
				<div className='flex flex-wrap gap-1'>
					{facilities.map((facility: string) => (
						<Badge variant={'secondary'} key={facility}>
							{facility}
						</Badge>
					))}
				</div>
			);
		},
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			const tent = row.original;
			return <ActionsDropdown tent={tent} />;
		},
	},
];

const ActionsDropdown = memo(({ tent }: { tent: Tent }) => {
	const {
		isEditOpen,
		isDeleteOpen,
		setIsEditOpen,
		setIsDeleteOpen,
		setSelectedTent,
		updateTentStatus,
	} = useTentStore();

	// Memoize the click handlers to prevent recreating functions on every render
	const handleEditClick = useCallback(() => {
		// Remove unnecessary console.logs in production
		if (process.env.NODE_ENV === 'development') {
			console.log('Opening edit modal for tent ID:', tent.id);
		}

		// Batch state updates to reduce rerenders
		// Prepare tent data first, then update state in one go
		setSelectedTent(tent);

		// Use setTimeout to break up the heavy JS work, preventing UI freeze
		setTimeout(() => {
			setIsEditOpen(true);
		}, 10);
	}, [tent, setSelectedTent, setIsEditOpen]);

	const handleDeleteClick = useCallback(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('Opening delete modal for tent ID:', tent.id);
		}

		setSelectedTent(tent);
		setIsDeleteOpen(true);
	}, [tent, setSelectedTent, setIsDeleteOpen]);

	const handleStatusUpdate = useCallback(
		async (status: 'available' | 'unavailable' | 'maintenance') => {
			if (process.env.NODE_ENV === 'development') {
				console.log('Updating tent status for ID:', tent.id, 'to:', status);
			}

			await updateTentStatus(tent.id, status);
		},
		[tent.id, updateTentStatus],
	);

	// Memoize dropdown items to avoid recreating on each render
	const dropdownItems = useMemo(
		() => (
			<>
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={(e) => {
						e.preventDefault();
						handleEditClick();
					}}
				>
					Edit Tent
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={(e) => {
						e.preventDefault();
						handleDeleteClick();
					}}
				>
					Delete Tent
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuLabel>Update Status</DropdownMenuLabel>
				<DropdownMenuItem
					onSelect={(e) => {
						e.preventDefault();
						handleStatusUpdate('available');
					}}
				>
					Set Available
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={(e) => {
						e.preventDefault();
						handleStatusUpdate('unavailable');
					}}
				>
					Set Unavailable
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={(e) => {
						e.preventDefault();
						handleStatusUpdate('maintenance');
					}}
				>
					Set Maintenance
				</DropdownMenuItem>
			</>
		),
		[handleEditClick, handleDeleteClick, handleStatusUpdate],
	);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						className='p-0 w-8 h-8'
						aria-label='Open tent actions menu'
					>
						<span className='sr-only'>Open menu</span>
						<MoreHorizontal className='w-4 h-4' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>{dropdownItems}</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs - Only render when open to reduce initial load */}
			{isEditOpen && (
				<Dialog modal open={isEditOpen} onOpenChange={setIsEditOpen}>
					<EditTentForm />
				</Dialog>
			)}

			{isDeleteOpen && (
				<Dialog modal open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
					<DeleteTentDialog />
				</Dialog>
			)}
		</>
	);
});

// Add display name
ActionsDropdown.displayName = 'ActionsDropdown';
