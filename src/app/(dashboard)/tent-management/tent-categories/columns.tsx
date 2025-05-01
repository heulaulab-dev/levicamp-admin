'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
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
import { EditCategoryForm } from '@/components/pages/tent-management/tent-categories/EditCategoryForm';
import { DeleteCategoryDialog } from '@/components/pages/tent-management/tent-categories/DeleteCategoryDialog';
import { useCategory } from '@/hooks/category/useCategory';
import { TentCategory } from '@/types/tent';

export const columns: ColumnDef<TentCategory>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Category Name' />
		),
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
		accessorKey: 'description',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Description' />
		),
		cell: ({ row }) => {
			const description = row.original.description || '';
			if (!description) return <span className='text-gray-500'>-</span>;

			// Truncate long descriptions
			return description.length > 50
				? `${description.substring(0, 50)}...`
				: description;
		},
	},
	{
		accessorKey: 'facilities',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Facilities' />
		),
		cell: ({ row }) => {
			const facilities = row.original.facilities || {};
			const facilityNames = Object.keys(facilities);

			if (facilityNames.length === 0)
				return <span className='text-gray-500'>-</span>;

			return (
				<div className='flex flex-wrap gap-1'>
					{facilityNames.map((facility: string) => (
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
			const category = row.original;

			return <ActionsDropdown category={category} />;
		},
	},
];

const ActionsDropdown = ({ category }: { category: TentCategory }) => {
	const {
		isEditOpen,
		isDeleteOpen,
		setIsEditOpen,
		setIsDeleteOpen,
		setSelectedCategory,
	} = useCategory();

	const handleEditClick = () => {
		setSelectedCategory(category);
		setIsEditOpen(true);
	};

	const handleDeleteClick = () => {
		setSelectedCategory(category);
		setIsDeleteOpen(true);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						className='p-0 w-8 h-8'
						aria-label='Open category actions menu'
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
						Edit Category
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault();
							handleDeleteClick();
						}}
					>
						Delete Category
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs */}
			<Dialog modal open={isEditOpen} onOpenChange={setIsEditOpen}>
				{isEditOpen && <EditCategoryForm />}
			</Dialog>

			<Dialog modal open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DeleteCategoryDialog />
			</Dialog>
		</>
	);
};
