import { useState } from 'react';
import { Booking } from '@/types/booking';
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';

interface AddBokingForm {
	booking: Booking;
	children: React.ReactNode;
}

export default function AddBookingForm({ children }: AddBokingForm) {
	const [open, setOpen] = useState(false);

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Add Booking</DrawerTitle>
				</DrawerHeader>
				<div className='p-4'></div>
				{/* Booking form content goes here */}

				{/* Add more fields as necessary */}
			</DrawerContent>
		</Drawer>
	);
}
