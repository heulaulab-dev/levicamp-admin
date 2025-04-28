'use client';

import { differenceInDays, format } from 'date-fns';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface ReservationSummaryProps {
	data: {
		selectedTents: Array<{
			id: string;
			name: string;
			tent_images: string[];
			category?: {
				name: string;
			};
			capacity: number;
			weekday_price?: number;
			weekend_price?: number;
			api_price?: number;
		}>;
		checkInDate?: Date;
		checkOutDate?: Date;
		totalPrice: number;
		isLoadingPrices?: boolean;
	};
	onBack?: () => void;
	onContinue?: () => void;
	backButtonText?: string;
	continueButtonText?: string;
	showButtons?: boolean;
	showBackButton?: boolean;
	showContinueButton?: boolean;
	isLoading?: boolean;
	disableContinue?: boolean;
}

export function ReservationSummary({
	data,
	onBack,
	onContinue,
	backButtonText = 'Back',
	continueButtonText = 'Continue',
	showButtons = true,
	showBackButton = true,
	showContinueButton = true,
	isLoading = false,
	disableContinue = false,
}: ReservationSummaryProps) {
	const {
		selectedTents,
		checkInDate,
		checkOutDate,
		totalPrice,
		isLoadingPrices = false,
	} = data;
	const finalPrice = totalPrice;

	// Calculate number of days
	const numberOfDays =
		checkInDate && checkOutDate
			? Math.max(
					1,
					differenceInDays(new Date(checkOutDate), new Date(checkInDate)),
			  )
			: 1;

	// Helper function to get tent price per night
	const getTentPricePerNight = (tent: (typeof selectedTents)[0]) => {
		if (isLoadingPrices) return null;
		return tent.api_price ? tent.api_price / numberOfDays : tent.weekend_price;
	};

	// Helper function to get tent total price
	const getTentTotalPrice = (tent: (typeof selectedTents)[0]) => {
		if (isLoadingPrices) return null;
		return (
			tent.api_price ??
			(tent.weekend_price ? tent.weekend_price * numberOfDays : 0)
		);
	};

	return (
		<Card className='mx-auto p-4 border rounded-2xl w-full max-w-2xl'>
			<CardHeader className='pb-2'>
				<CardTitle className='font-semibold text-primary text-xl md:text-2xl'>
					Reservation Summary
				</CardTitle>
			</CardHeader>
			<CardContent className='p-4'>
				{/* Section 1: Reservation Summary */}
				<div className='items-center gap-4 grid grid-cols-2'>
					<div>
						<h3 className='font-semibold text-sm'>Check-In</h3>
						<p className='font-semibold text-primary text-sm'>
							{checkInDate
								? format(new Date(checkInDate), 'EEE, dd MMM yyyy')
								: '-'}
						</p>
						<p className='text-sm'>From 14:00 WIB</p>
					</div>
					<div>
						<h3 className='font-semibold text-sm text-right'>Check-Out</h3>
						<p className='font-semibold text-primary text-sm text-right'>
							{checkOutDate
								? format(new Date(checkOutDate), 'EEE, dd MMM yyyy')
								: '-'}
						</p>
						<p className='text-sm text-right'>To 12:00 WIB</p>
					</div>
				</div>
				<div className='bg-primary mt-2 py-1 rounded-md font-medium text-white text-center'>
					{numberOfDays} {numberOfDays === 1 ? 'Day' : 'Days'}
				</div>

				<Separator className='my-3' />

				{/* Section 2: Selected Tents with Scrollable Area */}
				<div className='flex flex-col max-h-[500px]'>
					<h3 className='mb-2 font-semibold'>You Selected</h3>
					<ScrollArea className='h-80' data-lenis-prevent>
						{selectedTents.map((tent) => (
							<div key={tent.id} className='py-2 border-b'>
								<div className='flex items-start gap-3'>
									<div className='relative rounded-md w-16 h-16 overflow-hidden'>
										<Image
											src={tent.tent_images[0] || '/tent-image.jpg'}
											alt={tent.name}
											fill
											className='object-cover'
										/>
									</div>
									<div className='flex-1'>
										<p className='font-semibold text-brand'>{tent.name}</p>
										<div className='gap-2 grid grid-cols-2 text-sm'>
											<p className='font-medium'>Category:</p>
											<p className='text-right'>
												{tent.category?.name ?? 'Unknown'}
											</p>

											<p className='font-medium'>Max. Capacity:</p>
											<p className='text-right'>{tent.capacity} guests</p>

											<p className='font-medium'>Price/Night:</p>
											<div className='font-medium text-md text-primary text-right'>
												{isLoadingPrices ||
												getTentPricePerNight(tent) === null ? (
													<Skeleton className='ml-auto w-24 h-4' />
												) : (
													<>
														IDR{' '}
														{getTentPricePerNight(tent)!.toLocaleString(
															'id-ID',
														)}
													</>
												)}
											</div>

											<p className='font-medium'>
												Total ({numberOfDays}{' '}
												{numberOfDays === 1 ? 'day' : 'days'}):
											</p>
											<div className='font-medium text-md text-primary text-right'>
												{isLoadingPrices || getTentTotalPrice(tent) === null ? (
													<Skeleton className='ml-auto w-28 h-4' />
												) : (
													<>
														IDR{' '}
														{getTentTotalPrice(tent)!.toLocaleString('id-ID')}
													</>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</ScrollArea>

					{/* Section 3: Price Summary (Fixed at Bottom) */}
					<div className='mt-4'>
						<h3 className='font-semibold'>Price Summary</h3>
						<div className='flex justify-between text-sm'>
							<p>
								Total Tent Prices ({numberOfDays}{' '}
								{numberOfDays === 1 ? 'day' : 'days'})
							</p>
							<div className='font-medium text-primary'>
								{isLoadingPrices ? (
									<Skeleton className='w-28 h-4' />
								) : (
									`IDR ${totalPrice.toLocaleString('id-ID')}`
								)}
							</div>
						</div>

						<Separator className='my-3' />
						<div className='flex justify-between font-semibold text-md'>
							<p>Total Price</p>
							<div className='text-primary'>
								{isLoadingPrices ? (
									<Skeleton className='w-32 h-5' />
								) : (
									`IDR ${finalPrice.toLocaleString('id-ID')}`
								)}
							</div>
						</div>
					</div>

					{showButtons && (
						<div
							className={`mt-4 ${
								showBackButton && showContinueButton
									? 'grid grid-cols-2 gap-2'
									: ''
							}`}
						>
							{showBackButton && (
								<Button
									variant={'outline'}
									className='w-full'
									onClick={onBack}
									disabled={isLoading}
								>
									{backButtonText}
								</Button>
							)}
							{showContinueButton && (
								<Button
									className='w-full'
									onClick={onContinue}
									disabled={isLoading || disableContinue || isLoadingPrices}
								>
									{isLoading ? (
										<div className='flex items-center gap-2'>
											<div className='border-white border-t-2 border-b-2 rounded-full w-4 h-4 animate-spin'></div>
											<span>Processing...</span>
										</div>
									) : isLoadingPrices ? (
										'Calculating Prices...'
									) : (
										continueButtonText
									)}
								</Button>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
