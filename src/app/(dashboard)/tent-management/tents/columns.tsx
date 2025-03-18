'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Tent } from '@/types/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

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

export const columns: ColumnDef<Tent>[] = [
	{
		accessorKey: 'name',
		header: 'Tent Name',
	},
	{
		accessorKey: 'category',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Category' />
		),
		cell: ({ row }) => {
			const category = row.original.category;
			return <Badge>{category.name}</Badge>;
		},
	},
	{
		accessorKey: 'weekday_price',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Weekday Price' />
		),
		cell: ({ row }) =>
			new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
			}).format(row.original.weekday_price),
	},
	{
		accessorKey: 'weekend_price',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Weekend Price' />
		),
		cell: ({ row }) =>
			new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
			}).format(row.original.weekend_price),
	},
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Status' />
		),
		cell: ({ row }) => {
			const status = row.original.status.toLowerCase();
			const statusColor =
				status === 'available'
					? 'success'
					: status === 'unavailable'
					? 'destructive'
					: status === 'maintenance'
					? 'secondary'
					: 'default';

			return <Badge variant={statusColor}>{status}</Badge>;
		},
	},
	{
		accessorKey: 'facilities',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Facilities' />
		),
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
		cell: ({ row }) => {
			const tent = row.original;
			return <ActionsDropdown tent={tent} />;
		},
	},
];

const ActionsDropdown = ({ tent }: { tent: Tent }) => {
	const {
		isEditOpen,
		isDeleteOpen,
		setIsEditOpen,
		setIsDeleteOpen,
		setSelectedTent,
	} = useTentStore();

	const handleEditClick = () => {
		console.log('Opening edit modal for tent ID:', tent.id);
		console.log('Tent details:', tent);

		setSelectedTent(tent);
		setIsEditOpen(true);
	};

	const handleDeleteClick = () => {
		console.log('Opening delete modal for tent ID:', tent.id);

		setSelectedTent(tent);
		setIsDeleteOpen(true);
	};

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
				<DropdownMenuContent align='end'>
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
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs */}
			<Dialog modal open={isEditOpen} onOpenChange={setIsEditOpen}>
				{isEditOpen && <EditTentForm />}
			</Dialog>

			<Dialog modal open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DeleteTentDialog />
			</Dialog>
		</>
	);
};
