'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { TentCategory } from '@/types/types';
import { Dialog } from '@/components/tent-categories/CustomDialog';
import { Button } from '@/components/ui/button';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditCategoryForm } from '@/components/tent-categories/EditCategoryForm';
import { DeleteCategoryDialog } from '@/components/tent-categories/DeleteCategoryDialog';
import { useCategoryStore } from '@/hooks/category/useCategory';

export const columns: ColumnDef<TentCategory>[] = [
	{
		accessorKey: 'name',
		header: 'Category Name',
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
	} = useCategoryStore();

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
					<Button variant='ghost' className='p-0 w-8 h-8'>
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
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<EditCategoryForm />
			</Dialog>

			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DeleteCategoryDialog />
			</Dialog>
		</>
	);
};
