import { CopyIcon, Download } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export interface InvoiceDetailProps {
	bookingId: string;
	paymentDate: string;
	guestName: string;
	guestEmail: string;
	guestPhone: string;
	guestCount: string;
	checkInDate: string;
	checkOutDate: string;
	tents: Array<{
		id: string;
		name: string;
		image: string;
		category: string;
		capacity: number;
		price: number;
	}>;
	totalPrice: number;
	onDownload?: () => void;
	onContactUs?: () => void;
}

export default function InvoiceDetail({
	bookingId,
	paymentDate,
	guestName,
	guestEmail,
	guestPhone,
	guestCount,
	checkInDate,
	checkOutDate,
	tents = [],
	totalPrice = 0,
	onDownload = () => alert('Download functionality will be implemented here'),
	onContactUs = () => (window.location.href = 'mailto:support@levicamp.com'),
}: InvoiceDetailProps) {
	const bookingCode = bookingId;
	const subtotal = tents.reduce((sum, tent) => sum + tent.price, 0);

	return (
		<Card className='shadow-sm m-10 mx-auto w-full max-w-4xl'>
			<CardContent className='p-8'>
				<div className='flex md:flex-row flex-col justify-between items-start gap-4'>
					<div>
						<div className='flex items-center gap-2'>
							<h1 className='font-semibold text-xl'>Your Invoice</h1>
							<div className='flex items-center gap-1 font-medium text-primary'>
								#{bookingCode}
								<button className='text-gray-400 hover:text-gray-600'>
									<CopyIcon size={16} />
								</button>
							</div>
						</div>
						<p className='mt-1 text-muted-foreground'>
							Here are your booking details and payment summary. You can
							download or screenshot this page for quick access.
						</p>
					</div>
					<Button onClick={onDownload} className='w-full md:w-auto'>
						<Download className='mr-2 w-4 h-4' /> Download Invoice
					</Button>
				</div>

				<Separator className='my-6' />

				<section>
					<h2 className='mb-4 font-medium text-lg'>Invoice Details</h2>
					<div className='gap-y-3 grid grid-cols-2'>
						<div className='text-muted-foreground'>Booking Code</div>
						<div className='text-primary text-right'>#{bookingCode}</div>

						<div className='text-muted-foreground'>Payment Date</div>
						<div className='text-primary text-right'>{paymentDate}</div>

						<div className='text-muted-foreground'>Guest Name</div>
						<div className='text-primary text-right'>{guestName}</div>

						<div className='text-muted-foreground'>Guest Email</div>
						<div className='text-primary text-right'>{guestEmail}</div>

						<div className='text-muted-foreground'>Guest Phone</div>
						<div className='text-primary text-right'>{guestPhone}</div>

						<div className='text-muted-foreground'>Total Guests</div>
						<div className='text-primary text-right'>{guestCount} Guests</div>
					</div>
				</section>

				<Separator className='my-6' />

				<section>
					<h2 className='mb-4 font-medium text-lg'>Reservation Details</h2>

					{tents.map((tent, index) => (
						<div key={tent.id} className={index > 0 ? 'mt-6' : 'mb-6'}>
							<div className='flex gap-4'>
								<div className='relative rounded-md w-28 h-20 overflow-hidden'>
									<Image
										src={'/tent-image.jpg'}
										alt={tent.name}
										fill
										className='object-cover'
									/>
								</div>
								<div className='flex-1'>
									<h3 className='font-medium text-primary'>{tent.name}</h3>
									<div className='gap-y-2 grid grid-cols-2 mt-1'>
										<div className='text-muted-foreground'>Category</div>
										<div className='text-right'>{tent.category}</div>

										<div className='text-muted-foreground'>Max. Capacity</div>
										<div className='text-right'>{tent.capacity} Guests</div>

										<div className='text-muted-foreground'>Price</div>
										<div className='text-primary text-right'>
											IDR {tent.price.toLocaleString('id-ID')}
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</section>

				<Separator className='my-6' />

				<section>
					<h2 className='mb-4 font-medium text-lg'>Payment Details</h2>
					<div className='gap-y-3 grid grid-cols-2'>
						<div className='text-muted-foreground'>Reservation Date</div>
						<div className='text-primary text-right'>
							{checkInDate} - {checkOutDate}
						</div>

						<div className='text-muted-foreground'>Prices</div>
						<div className='text-primary text-right'>
							IDR {subtotal.toLocaleString('id-ID')}
						</div>
					</div>

					<div className='flex justify-between items-center mt-6 py-2'>
						<div className='font-medium'>Total Price</div>
						<div className='font-semibold text-primary text-xl'>
							IDR {totalPrice.toLocaleString('id-ID')}
						</div>
					</div>
				</section>
			</CardContent>

			<CardFooter className='p-6 rounded-b-lg'>
				<div className='flex justify-between items-center w-full'>
					<div className='text-muted-foreground text-sm'>
						If you have any{' '}
						<span className='font-medium'>questions or need assistance</span>,
						please contact our support team
					</div>
					<Button
						variant='outline'
						className='hover:bg-primary/10 border-primary text-primary'
						onClick={onContactUs}
					>
						Contact Us
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}
