'use client';

import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import { useBookings } from '@/hooks/bookings/use-bookings';
import { Booking, UpdateBookingRequest } from '@/types/booking';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const statusOptions = [
	'pending',
	'confirmed',
	'checked_in',
	'completed',
	'cancelled',
	'refund',
	'rescheduled',
];

interface BookingActionDialogProps {
	booking: Booking;
	children: React.ReactNode;
	type: 'checkin' | 'checkout' | 'modify' | 'cancel' | 'addons';
}

export function BookingActionDialog({
	booking,
	children,
	type,
}: BookingActionDialogProps) {
	const [open, setOpen] = useState(false);
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [status, setStatus] = useState(booking.status);
	const [totalAmount, setTotalAmount] = useState(
		(booking.total_amount || 0).toString(),
	);
	const [startDate, setStartDate] = useState(booking.start_date || '');
	const [endDate, setEndDate] = useState(booking.end_date || '');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { updateBooking, checkInBooking, checkOutBooking, cancelBooking } =
		useBookings();

	const handleAction = async () => {
		setIsSubmitting(true);
		try {
			switch (type) {
				case 'checkin':
					if (booking.status !== 'confirmed') {
						toast.error('Only confirmed bookings can be checked in');
						return;
					}
					await checkInBooking(booking.id);
					break;
				case 'checkout':
					if (booking.status !== 'checked_in') {
						toast.error('Only checked_in bookings can be checked out');
						return;
					}
					await checkOutBooking(booking.id);
					break;
				case 'modify': {
					const updateData: UpdateBookingRequest = {};

					if (status !== booking.status) {
						updateData.status = status as UpdateBookingRequest['status'];
					}

					if (totalAmount && parseInt(totalAmount) !== booking.total_amount) {
						updateData.total_amount = parseInt(totalAmount);
					}

					if (startDate !== booking.start_date) {
						updateData.start_date = startDate;
					}

					if (endDate !== booking.end_date) {
						updateData.end_date = endDate;
					}

					if (Object.keys(updateData).length === 0) {
						toast.info('No changes detected');
						setOpen(false);
						return;
					}

					await updateBooking(booking.id, updateData);
					break;
				}
				case 'cancel':
					await cancelBooking(booking.id, 'cancelled');
					break;
				case 'addons':
					// This would be implemented in a separate component for addon management
					toast.info('Addon management not implemented in this dialog');
					break;
			}
			setOpen(false);
		} catch (error) {
			console.error('Error handling action:', error);
			toast.error('An error occurred while processing your request');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Helper function to get dialog content based on type and booking status
	const getDialogContent = () => {
		if (type === 'checkin' && booking.status !== 'confirmed') {
			return {
				title: 'Cannot Check-in Guest',
				description:
					'This booking must be in confirmed status before check-in.',
				buttonText: 'Close',
				showAction: false,
			};
		}

		if (type === 'checkout' && booking.status !== 'checked_in') {
			return {
				title: 'Cannot Check-out Guest',
				description:
					'This booking must be in checked_in status before check-out.',
				buttonText: 'Close',
				showAction: false,
			};
		}

		const titles = {
			checkin: 'Check-in Guest',
			checkout: 'Check-out Guest',
			modify: 'Modify Booking',
			cancel: 'Cancel Booking',
			addons: 'Manage Add-ons',
		};

		const descriptions = {
			checkin: `Are you sure you want to check in ${
				booking.guest?.name || 'this guest'
			}?`,
			checkout: `Are you sure you want to check out ${
				booking.guest?.name || 'this guest'
			}?`,
			modify: 'Update the booking details below.',
			cancel: `Are you sure you want to cancel booking ${booking.id}?`,
			addons: 'Manage additional items for this booking.',
		};

		const buttonTexts = {
			checkin: 'Check In',
			checkout: 'Check Out',
			modify: 'Save Changes',
			cancel: 'Cancel Booking',
			addons: 'Save Add-ons',
		};

		return {
			title: titles[type],
			description: descriptions[type],
			buttonText: buttonTexts[type],
			showAction: true,
		};
	};

	const dialogContent = getDialogContent();

	const renderModifyContent = () => (
		<div className='gap-4 grid py-4'>
			<div className='gap-2 grid'>
				<div>
					<p className='mb-2 font-medium'>Booking Details</p>
					<p>Guest: {booking.guest?.name || 'N/A'}</p>
					<p>Phone: {booking.guest?.phone || 'N/A'}</p>
					<p>Guest Count: {booking.guest?.guest_count || 0} guests</p>
					<p>Source: {booking.guest?.source || 'N/A'}</p>
					<p>
						Tent:{' '}
						{booking.detail_booking?.[0]?.reservation?.tent?.name || 'N/A'} (
						{booking.detail_booking?.[0]?.reservation?.tent?.category?.name ||
							'N/A'}
						)
					</p>
				</div>

				<div className='gap-4 grid py-4'>
					<div className='gap-4 grid grid-cols-2'>
						<div className='space-y-2'>
							<Label htmlFor='start-date'>Start Date</Label>
							<Input
								id='start-date'
								type='date'
								value={startDate ? startDate.split('T')[0] : ''}
								onChange={(e) => setStartDate(e.target.value)}
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='end-date'>End Date</Label>
							<Input
								id='end-date'
								type='date'
								value={endDate ? endDate.split('T')[0] : ''}
								onChange={(e) => setEndDate(e.target.value)}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='amount'>Total Amount (IDR)</Label>
						<Input
							id='amount'
							type='number'
							value={totalAmount}
							onChange={(e) => setTotalAmount(e.target.value)}
							min='0'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='status'>Status</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger id='status'>
								<SelectValue placeholder='Select status' />
							</SelectTrigger>
							<SelectContent>
								{statusOptions.map((option) => (
									<SelectItem key={option} value={option}>
										{option.charAt(0).toUpperCase() + option.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
		</div>
	);

	const renderCancelContent = () => (
		<div className='gap-4 grid py-4'>
			<div className='space-y-2'>
				<p className='text-muted-foreground text-sm'>
					This booking will be marked as cancelled and cannot be undone.
				</p>
			</div>
		</div>
	);

	const content = (
		<>
			{type === 'modify' && renderModifyContent()}
			{type === 'cancel' && renderCancelContent()}

			{/* Add other specific form content for addons or other types here */}
		</>
	);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className='sm:max-w-[500px]'>
					<DialogHeader>
						<DialogTitle>{dialogContent.title}</DialogTitle>
						<DialogDescription>{dialogContent.description}</DialogDescription>
					</DialogHeader>

					{content}

					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
						>
							{dialogContent.showAction ? 'Cancel' : 'Close'}
						</Button>
						{dialogContent.showAction && (
							<Button
								variant={type === 'cancel' ? 'destructive' : 'default'}
								onClick={handleAction}
								disabled={isSubmitting}
							>
								{isSubmitting && (
									<svg
										className='mr-2 w-4 h-4 animate-spin'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
									>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
										></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										></path>
									</svg>
								)}
								{dialogContent.buttonText}
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>{dialogContent.title}</DrawerTitle>
					<DrawerDescription>{dialogContent.description}</DrawerDescription>
				</DrawerHeader>

				<div className='px-4'>{content}</div>

				<DrawerFooter>
					{dialogContent.showAction ? (
						<>
							<Button
								variant={type === 'cancel' ? 'destructive' : 'default'}
								onClick={handleAction}
								disabled={isSubmitting}
							>
								{isSubmitting && (
									<svg
										className='mr-2 w-4 h-4 animate-spin'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
									>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
										></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										></path>
									</svg>
								)}
								{dialogContent.buttonText}
							</Button>
							<Button
								variant='outline'
								onClick={() => setOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
						</>
					) : (
						<Button variant='outline' onClick={() => setOpen(false)}>
							Close
						</Button>
					)}
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
