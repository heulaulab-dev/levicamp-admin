'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { BookingManagementList } from '@/components/pages/booking-management/BookingManagementList';

export default function BookingManagementPage() {
	return (
		<div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
			<PageHeader
				title='Booking Management'
				subtitle='View and manage all bookings in one place'
			/>
			<BookingManagementList />
		</div>
	);
}
