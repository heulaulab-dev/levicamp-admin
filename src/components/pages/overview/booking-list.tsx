'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useBookingsStore } from '@/hooks/overview/useBookings';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/app/(dashboard)/overview/columns';

export function BookingList() {
	const { getBookings, bookings } = useBookingsStore();
	const initialFetchDone = useRef(false);

	// Fetch bookings when component mounts
	useEffect(() => {
		if (!initialFetchDone.current) {
			initialFetchDone.current = true;
			getBookings();
		}
	}, [getBookings]);

	const handleExport = () => {
		toast.success('Data exported successfully');
	};
	return (
		<div>
			<div className='flex justify-end mb-4'>
				<Button onClick={handleExport} variant='outline'>
					<Download className='mr-2 w-4 h-4' />
					Export Data
				</Button>
			</div>
			<DataTable columns={columns} data={bookings} />
		</div>
	);
}
