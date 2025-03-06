import { columns, Admin } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

async function getData(): Promise<Admin[]> {
	// Fetch data from your API here.
	return [
		{
			id: '728ed52f',
			name: 'Tazkiya Mujahid',
			username: 'tazkiyadigitalarchive',
			email: 'tazkiyadigitalarchive@gmail.com',
			phone: '081234567890',
		},
		{
			id: '728ed52f',
			name: 'Tazkiya Mujahid',
			username: 'tazkiyadigitalarchive',
			email: 'tazkiyadigitalarchive@gmail.com',
			phone: '081234567890',
		},
	];
}

export default async function AdminManagementPage() {
	const data = await getData();

	return (
		<div className='mx-auto py-10 container'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='font-semibold text-2xl'>Admin Management</h1>
				<Button>
					<PlusCircle size={16} />
					<span>Add Admin</span>
				</Button>
			</div>

			<DataTable columns={columns} data={data} />
		</div>
	);
}
