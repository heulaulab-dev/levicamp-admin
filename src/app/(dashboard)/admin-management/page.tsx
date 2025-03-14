import { columns, Admin } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/common/PageHeader';

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
			<PageHeader title='Admin Management' />

			<DataTable columns={columns} data={data} />
		</div>
	);
}
