'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
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
import { EditCategoryForm } from '@/components/pages/tent-management/tent-categories/EditCategoryForm';
import { DeleteCategoryDialog } from '@/components/pages/tent-management/tent-categories/DeleteCategoryDialog';
import { useCategory } from '@/hooks/category/useCategory';
import { TentCategory } from '@/types/tent';
import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<TentCategory>[] = [
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
		header: 'Category Name',
		cell: ({ row }) => (
			<div className='left-8 z-10 sticky font-medium'>
				{row.getValue('name')}
			</div>
		),
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
		accessorKey: 'description',
		header: 'Description',
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
		header: 'Facilities',
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
		header: 'Actions',
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
		console.log('Opening edit modal for category ID:', category.id);
		setSelectedCategory(category);
		setIsEditOpen(true);
	};

	const handleDeleteClick = () => {
		console.log('Opening delete modal for category ID:', category.id);
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
