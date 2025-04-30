'use client';

import { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog } from '@radix-ui/react-dialog';
import { MoreHorizontal } from 'lucide-react';
import { EditAdminForm } from '@/components/pages/admin-management/edit-admin-form';
import { useAdminStore } from '@/hooks/admin/use-admins';
import { DeleteAdminDialog } from '@/components/pages/admin-management/DeleteAdminDialog';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Admin = {
	id: string;
	name: string;
	username: string;
	email: string;
	phone: string;
	password: string;
	created_at: string;
	updated_at: string;
};

export const columns: ColumnDef<Admin>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
	},
	{
		accessorKey: 'username',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Username' />
		),
	},
	{
		accessorKey: 'email',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Email' />
		),
	},
	{
		accessorKey: 'phone',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Phone' />
		),
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const admin = row.original;
			return <ActionsDropdown admin={admin} />;
		},
	},
];

const ActionsDropdown = ({ admin }: { admin: Admin }) => {
	const {
		isEditModalOpen,
		setIsEditModalOpen,
		isDeleteModalOpen,
		setIsDeleteModalOpen,
		setSelectedAdmin,
	} = useAdminStore();

	const handleEditClick = () => {
		setSelectedAdmin(admin);
		setIsEditModalOpen(true);
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
						Edit Admin
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault();
							setSelectedAdmin(admin);
							setIsDeleteModalOpen(true);
						}}
					>
						Delete Admin
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs */}
			<Dialog modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<EditAdminForm />
			</Dialog>

			<Dialog
				modal
				open={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
			>
				<DeleteAdminDialog />
			</Dialog>
		</>
	);
};
