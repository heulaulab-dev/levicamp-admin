import { Payment, columns } from './columns';
import { DataTable } from './data-table';

async function getData(): Promise<Payment[]> {
	// Fetch data from your API here.
	return [
		{
			id: '728ed52f',
			amount: 100,
			status: 'pending',
			email: 'tazkiyadigitalarchive@example.com',
		},
		{
			id: '489ae52b',
			amount: 250,
			status: 'processing',
			email: 'modiecuy@example.com',
		},
		{
			id: '963fd14c',
			amount: 75,
			status: 'success',
			email: 'jaidkw@example.com',
		},
		{
			id: '157bc23d',
			amount: 180,
			status: 'failed',
			email: 'adanwasahlan@example.com',
		},
		{
			id: '342ef89a',
			amount: 300,
			status: 'pending',
			email: 'user1@example.com',
		},
		{
			id: '891cd45e',
			amount: 150,
			status: 'success',
			email: 'user2@example.com',
		},
		{
			id: '567gh12i',
			amount: 200,
			status: 'processing',
			email: 'user3@example.com',
		},
		{
			id: '234jk67l',
			amount: 125,
			status: 'pending',
			email: 'user4@example.com',
		},
		{
			id: '728ed52f',
			amount: 100,
			status: 'pending',
			email: 'tazkiyadigitalarchive@example.com',
		},
		{
			id: '489ae52b',
			amount: 250,
			status: 'processing',
			email: 'modiecuy@example.com',
		},
		{
			id: '963fd14c',
			amount: 75,
			status: 'success',
			email: 'jaidkw@example.com',
		},
		{
			id: '157bc23d',
			amount: 180,
			status: 'failed',
			email: 'adanwasahlan@example.com',
		},
		{
			id: '342ef89a',
			amount: 300,
			status: 'pending',
			email: 'user1@example.com',
		},
		{
			id: '891cd45e',
			amount: 150,
			status: 'success',
			email: 'user2@example.com',
		},
		{
			id: '567gh12i',
			amount: 200,
			status: 'processing',
			email: 'user3@example.com',
		},
		{
			id: '234jk67l',
			amount: 125,
			status: 'pending',
			email: 'user4@example.com',
		},
	];
}

export default async function ReservationManagementPage() {
	const data = await getData();

	return (
		<div className='mx-auto py-10 container'>
			<DataTable columns={columns} data={data} />
		</div>
	);
}
