import { Booking } from '@/types/booking';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BookingDetailsModalProps {
	booking: Booking;
	children: React.ReactNode;
}

interface DetailRowProps {
	label: string;
	value: React.ReactNode;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
	<div className='flex items-center py-2'>
		<span className='w-32 font-medium text-muted-foreground'>{label}</span>
		<span className='flex-1'>{value}</span>
	</div>
);

const getStatusColor = (status: string) => {
	const colors = {
		'pending': 'bg-yellow-100 text-yellow-800',
		'confirmed': 'bg-blue-100 text-blue-800',
		'checked-in': 'bg-green-100 text-green-800',
		'completed': 'bg-purple-100 text-purple-800',
		'cancelled': 'bg-red-100 text-red-800',
		'refund': 'bg-orange-100 text-orange-800',
		'rescheduled': 'bg-indigo-100 text-indigo-800',
	};
	return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export function BookingDetailsModal({
	booking,
	children,
}: BookingDetailsModalProps) {
	const [open, setOpen] = useState(false);
	const isDesktop = useMediaQuery('(min-width: 768px)');

	const BookingDetails = () => (
		<div className='space-y-6'>
			<div className='gap-6 grid md:grid-cols-2'>
				{/* Guest Information */}
				<Card>
					<CardHeader className='pb-4'>
						<CardTitle className='font-semibold text-lg'>
							Guest Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2'>
						<DetailRow label='Name' value={booking.guest.name} />
						<DetailRow label='Phone' value={booking.guest.phone} />
						<DetailRow label='Email' value={booking.guest.email} />
						<DetailRow label='Address' value={booking.guest.address} />
					</CardContent>
				</Card>

				{/* Booking Information */}
				<Card>
					<CardHeader className='pb-4'>
						<CardTitle className='font-semibold text-lg'>
							Booking Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2'>
						<DetailRow label='Booking ID' value={booking.id} />
						<DetailRow
							label='Status'
							value={
								<Badge className={getStatusColor(booking.status)}>
									{booking.status.charAt(0).toUpperCase() +
										booking.status.slice(1)}
								</Badge>
							}
						/>
						<DetailRow
							label='Total Amount'
							value={new Intl.NumberFormat('id-ID', {
								style: 'currency',
								currency: 'IDR',
							}).format(booking.total_amount)}
						/>
					</CardContent>
				</Card>
			</div>

			{/* Dates Information */}
			<Card>
				<CardHeader className='pb-4'>
					<CardTitle className='font-semibold text-lg'>
						Dates Information
					</CardTitle>
				</CardHeader>
				<CardContent className='gap-6 grid md:grid-cols-2'>
					<div className='space-y-2'>
						<h4 className='font-medium text-muted-foreground text-sm'>
							Stay Period
						</h4>
						<DetailRow
							label='Check-in'
							value={new Date(booking.start_date).toLocaleDateString()}
						/>
						<DetailRow
							label='Check-out'
							value={new Date(booking.end_date).toLocaleDateString()}
						/>
					</div>
					<div className='space-y-2'>
						<h4 className='font-medium text-muted-foreground text-sm'>
							Booking Record
						</h4>
						<DetailRow
							label='Created'
							value={new Date(booking.created_at).toLocaleString()}
						/>
						{booking.updated_at && (
							<DetailRow
								label='Last Updated'
								value={new Date(booking.updated_at).toLocaleString()}
							/>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Tent Details */}
			<Card>
				<CardHeader className='pb-4'>
					<CardTitle className='font-semibold text-lg'>Tent Details</CardTitle>
				</CardHeader>
				<CardContent className='space-y-6'>
					{booking.detail_booking.map((detail, index) => (
						<div key={index}>
							{index > 0 && <Separator className='my-4' />}
							<div className='space-y-2'>
								<DetailRow
									label='Tent Name'
									value={detail.reservation.tent.name}
								/>
								<DetailRow
									label='Category'
									value={detail.reservation.tent.category.name}
								/>
								<DetailRow
									label='Price'
									value={new Intl.NumberFormat('id-ID', {
										style: 'currency',
										currency: 'IDR',
									}).format(detail.reservation.price)}
								/>
								<DetailRow
									label='Status'
									value={
										<Badge variant='outline'>{detail.reservation.status}</Badge>
									}
								/>
								{detail.reservation.tent.facilities?.length > 0 && (
									<div className='pt-2'>
										<h4 className='mb-2 font-medium text-muted-foreground text-sm'>
											Facilities
										</h4>
										<div className='flex flex-wrap gap-2'>
											{detail.reservation.tent.facilities.map(
												(facility, facilityIndex) => (
													<Badge
														key={facilityIndex}
														variant='secondary'
														className='text-xs'
													>
														{facility}
													</Badge>
												),
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Booking Details</DialogTitle>
						<DialogDescription>
							Complete information about this booking
						</DialogDescription>
					</DialogHeader>
					<BookingDetails />
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Booking Details</DrawerTitle>
					<DrawerDescription>
						Complete information about this booking
					</DrawerDescription>
				</DrawerHeader>
				<div className='px-4 pb-8'>
					<BookingDetails />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
