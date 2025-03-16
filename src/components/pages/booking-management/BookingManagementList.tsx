import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useBookingsStore } from '@/hooks/overview/useBookings';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/app/(dashboard)/booking-management/columns';

// Loading skeleton for the booking list
function BookingListSkeleton() {
	return (
		<div>
			<div className='flex justify-end mb-4'>
				<Skeleton className='w-32 h-10' />
			</div>
			<div className='border rounded-md'>
				<div className='p-4'>
					<div className='space-y-3'>
						<Skeleton className='w-full h-10' />
						<Skeleton className='w-full h-32' />
					</div>
				</div>
			</div>
		</div>
	);
}

export function BookingManagementList() {
	const { getBookings, bookings, isLoading } = useBookingsStore();
	const initialFetchDone = useRef(false);

	// Fetch bookings when component mounts
	useEffect(() => {
		if (!initialFetchDone.current) {
			console.log('Initial bookings management list mount - fetching data');
			initialFetchDone.current = true;
			getBookings();
		}
	}, [getBookings]);

	const handleExport = () => {
		toast.success('Data exported successfully');
	};

	// Show loading state
	if (isLoading) {
		return <BookingListSkeleton />;
	}

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
