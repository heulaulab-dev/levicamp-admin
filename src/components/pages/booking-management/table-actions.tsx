import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal } from 'lucide-react';
import { BookingDetailsModal } from '@/components/pages/booking-management/booking-details-modal';
import { BookingActionDialog } from '@/components/pages/booking-management/booking-action-dialog';
import { Booking } from '@/types/booking';

export default function TableActions({ booking }: { booking: Booking }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='p-0 w-8 h-8'>
					<span className='sr-only'>Open menu</span>
					<MoreHorizontal className='w-4 h-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<BookingDetailsModal booking={booking}>
					<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
						<Eye className='mr-2 w-4 h-4' />
						View Details
					</DropdownMenuItem>
				</BookingDetailsModal>
				<DropdownMenuSeparator />
				{booking.status === 'confirmed' && (
					<BookingActionDialog booking={booking} type='checkin'>
						<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
							Check-in Guest
						</DropdownMenuItem>
					</BookingActionDialog>
				)}
				{booking.status === 'checked_in' && (
					<BookingActionDialog booking={booking} type='checkout'>
						<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
							Check-out Guest
						</DropdownMenuItem>
					</BookingActionDialog>
				)}
				<BookingActionDialog booking={booking} type='modify'>
					<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
						Modify Booking
					</DropdownMenuItem>
				</BookingActionDialog>
				<BookingActionDialog booking={booking} type='cancel'>
					<DropdownMenuItem
						onSelect={(e) => e.preventDefault()}
						className='text-red-600'
					>
						Cancel Booking
					</DropdownMenuItem>
				</BookingActionDialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
