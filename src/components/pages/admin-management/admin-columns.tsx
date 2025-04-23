import { Checkbox } from '@/components/ui/checkbox';
import { ActionsDropdown } from '@/components/pages/admin-management/table-actions';

import { ColumnDef } from '@tanstack/react-table';

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
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		size: 30,
		enableSorting: false,
	},
	{
		header: 'Name',
		accessorKey: 'name',
		cell: ({ row }) => (
			<div className='font-medium'>{row.getValue('name')}</div>
		),
	},
	{
		header: 'Email',
		accessorKey: 'email',
		cell: ({ row }) => (
			<div className='text-muted-foreground'>{row.getValue('email')}</div>
		),
		size: 250, // kasih cukup ruang default
		minSize: 150,
		maxSize: 400,
	},
	{
		header: 'Username',
		accessorKey: 'username',
		cell: ({ row }) => (
			<div className='text-muted-foreground'>{row.getValue('username')}</div>
		),
	},
	{
		header: 'Phone',
		accessorKey: 'phone',
		cell: ({ row }) => (
			<div className='text-muted-foreground'>{row.getValue('phone')}</div>
		),
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
		header: 'Updated At',
		accessorKey: 'updated_at',
		cell: ({ row }) => {
			const date = new Date(row.original.updated_at);
			return (
				<div className='text-muted-foreground'>
					{date.toISOString().split('T')[0]}
				</div>
			);
		},
	},

	{
		header: 'Actions',
		id: 'Actions',
		cell: ({ row }) => {
			const admin = row.original;
			return <ActionsDropdown admin={admin} />;
		},
	},
];
