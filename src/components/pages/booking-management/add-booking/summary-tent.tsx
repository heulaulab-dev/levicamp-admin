/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { differenceInDays, format } from 'date-fns';
import { TentIcon, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useReservations } from '@/hooks/reservations/use-reservations';
import { Tent } from '@/types/reservations';

interface SummaryTentProps {
	selectedTents: Tent[];
	onRemove: (tentId: string) => void;
	checkInDate?: Date;
	checkOutDate?: Date;
	onRequestBook?: () => void;
	clearPreviousData?: boolean;
}

export default function SummaryTent({
	selectedTents,
	onRemove,
	checkInDate = new Date(),
	checkOutDate = new Date(),
	onRequestBook,
	clearPreviousData = true,
}: SummaryTentProps) {
	// State variables
	const [loading, setLoading] = useState(false);
	const [loadingPerTent, setLoadingPerTent] = useState<Record<string, boolean>>(
		{},
	);
	const [tentsWithPrices, setTentsWithPrices] = useState<
		Record<string, number>
	>({});
	const [tentCategoryFromApi, setTentCategoryFromApi] = useState<
		Record<string, string>
	>({});
	const [tentCapacityFromApi, setTentCapacityFromApi] = useState<
		Record<string, string>
	>({});
	const [totalPrice, setTotalPrice] = useState(0);
	const [days, setDays] = useState(0);

	// Get the checkPrice function from the hook
	const { checkPrice } = useReservations();

	// Fetch prices when tents or dates change
	useEffect(() => {
		const fetchPrice = async () => {
			setLoading(true);
			// Set all tents to loading state
			const newLoadingState: Record<string, boolean> = {};
			selectedTents.forEach((tent) => {
				newLoadingState[tent.id] = true;
			});
			setLoadingPerTent(newLoadingState);

			try {
				if (selectedTents.length > 0 && checkInDate && checkOutDate) {
					const data = await checkPrice(
						selectedTents.map((t) => t.id),
						checkInDate,
						checkOutDate,
					);

					if (data !== null && data.data) {
						setTotalPrice(data.data.total_price);
						const priceMap: Record<string, number> = {};
						const categoryMap: Record<string, string> = {};
						const capacityMap: Record<string, string> = {};
						const loadingMap: Record<string, boolean> = {};

						data.data.tents.forEach(
							(t: {
								id: string;
								price: number;
								category: string;
								capacities: string;
							}) => {
								priceMap[t.id] = t.price;
								categoryMap[t.id] = t.category;
								capacityMap[t.id] = t.capacities;
								loadingMap[t.id] = false;
							},
						);

						setTentsWithPrices(priceMap);
						setTentCategoryFromApi(categoryMap);
						setTentCapacityFromApi(capacityMap);
						setLoadingPerTent(loadingMap);
					}
				} else {
					setTotalPrice(0);
				}
			} catch (err) {
				console.error('Failed to fetch price', err);
				// Reset loading state on error
				const resetLoadingState: Record<string, boolean> = {};
				selectedTents.forEach((tent) => {
					resetLoadingState[tent.id] = false;
				});
				setLoadingPerTent(resetLoadingState);
			} finally {
				setLoading(false);
			}
		};

		fetchPrice();
	}, [selectedTents, checkInDate, checkOutDate, checkPrice]);

	// Calculate days between start and end dates
	useEffect(() => {
		if (checkInDate && checkOutDate) {
			const diff = differenceInDays(checkOutDate, checkInDate);
			setDays(diff);
		}
	}, [checkInDate, checkOutDate]);

	// Check if we have prices for all tents
	const allPricesLoaded = selectedTents.every(
		(tent) =>
			tentsWithPrices[tent.id] !== undefined && !loadingPerTent[tent.id],
	);

	// Calculate total price only if all prices are loaded
	const calculatedTotalPrice = allPricesLoaded
		? selectedTents.reduce(
				(sum, tent) => sum + (tentsWithPrices[tent.id] || 0),
				0,
		  )
		: 0;

	// Use API price or calculated total
	const finalPrice = totalPrice > 0 ? totalPrice : calculatedTotalPrice;

	// Get category and capacity (from API if available, otherwise from tent data)
	const getTentCategory = (tent: Tent) => {
		return tentCategoryFromApi[tent.id] || tent.category?.name || 'Unknown';
	};

	const getTentCapacity = (tent: Tent) => {
		return tentCapacityFromApi[tent.id] || `${tent.capacity} guests`;
	};

	// Get price per night (avoid using weekend_price as fallback)
	const getPricePerNight = (tent: Tent) => {
		if (!tentsWithPrices[tent.id] || loadingPerTent[tent.id]) {
			return null; // No price available yet
		}
		return tentsWithPrices[tent.id] / (days || 1);
	};

	// Get total price for a tent
	const getTotalTentPrice = (tent: Tent) => {
		if (!tentsWithPrices[tent.id] || loadingPerTent[tent.id]) {
			return null; // No price available yet
		}
		return tentsWithPrices[tent.id];
	};

	const handleRequestBook = () => {
		// Call the onRequestBook prop function if provided
		if (onRequestBook) {
			// The parent component should handle clearing previous data
			// based on the clearPreviousData flag
			onRequestBook();
		}
	};

	return (
		<Card className='shadow-md p-4 border rounded-2xl w-full'>
			<CardHeader className='pb-2'>
				<CardTitle className='font-semibold text-primary text-xl'>
					Reservation Summary
				</CardTitle>
			</CardHeader>
			<CardContent>
				{/* Section 1: Reservation Summary */}
				<div className='items-center gap-4 grid grid-cols-2'>
					<div>
						<h3 className='font-semibold text-sm'>Check-In</h3>
						<p className='font-semibold text-primary text-sm'>
							{format(checkInDate, 'EEE, dd MMM yyyy')}
						</p>
						<p className='text-sm'>From 14:00 WIB</p>
					</div>
					<div>
						<h3 className='font-semibold text-sm text-right'>Check-Out</h3>
						<p className='font-semibold text-primary text-sm text-right'>
							{format(checkOutDate, 'EEE, dd MMM yyyy')}
						</p>
						<p className='text-sm text-right'>To 12:00 WIB</p>
					</div>
				</div>
				<div className='bg-secondary mt-2 py-1 rounded-md font-medium text-primary text-center'>
					{days > 0 ? days : 1} {days === 1 ? 'Day' : 'Days'}
				</div>

				<Separator className='bg-secondary my-3' />

				{/* Section 2: Selected Tents with Scrollable Area */}
				<div className='flex flex-col'>
					<h3 className='mb-2 font-semibold text-sm'>You Selected</h3>
					<ScrollArea className='h-80' data-lenis-prevent>
						{selectedTents.length === 0 ? (
							<div className='py-8 text-muted-foreground text-center'>
								<TentIcon className='opacity-50 mx-auto mb-2 w-12 h-12' />
								<p>No tents selected</p>
								<p className='mt-1 text-sm'>Select tents to continue booking</p>
							</div>
						) : (
							selectedTents.map((tent) => (
								<div key={tent.id} className='py-2 border-primary border-b'>
									{/* Name & Trash Icon in the same row */}
									<div className='flex justify-between items-center'>
										<p className='font-semibold text-primary'>{tent.name}</p>
										<Button
											variant='link'
											size='icon'
											onClick={() => onRemove(tent.id)}
											disabled={loading || loadingPerTent[tent.id]}
										>
											<Trash2 className='w-5 h-5 text-red-500' />
										</Button>
									</div>

									{/* Tent Details */}
									<div className='gap-2 grid grid-cols-2 text-sm'>
										<p className='font-medium'>Category:</p>
										<p className='text-right'>{getTentCategory(tent)}</p>

										<p className='font-medium'>Max. Capacity:</p>
										<p className='text-right'>{getTentCapacity(tent)}</p>

										<p className='font-medium'>Price/Night:</p>
										<div className='font-medium text-md text-primary text-right'>
											{loadingPerTent[tent.id] ||
											getPricePerNight(tent) === null ? (
												<Skeleton className='ml-auto w-24 h-4' />
											) : (
												<>
													IDR {getPricePerNight(tent)!.toLocaleString('id-ID')}
												</>
											)}
										</div>

										<p className='font-medium'>
											Total ({days > 0 ? days : 1} {days === 1 ? 'day' : 'days'}
											):
										</p>
										<div className='font-medium text-md text-primary text-right'>
											{loadingPerTent[tent.id] ||
											getTotalTentPrice(tent) === null ? (
												<Skeleton className='ml-auto w-28 h-4' />
											) : (
												<>
													IDR {getTotalTentPrice(tent)!.toLocaleString('id-ID')}
												</>
											)}
										</div>
									</div>
								</div>
							))
						)}
					</ScrollArea>
				</div>

				{/* Section 3: Price Summary (Fixed at Bottom) */}
				{selectedTents.length > 0 && (
					<div className='mt-4'>
						<h3 className='font-semibold text-sm'>Price Summary</h3>
						<div className='flex justify-between text-sm'>
							<p>
								Total Tent Prices ({days > 0 ? days : 1}{' '}
								{days === 1 ? 'day' : 'days'})
							</p>
							<div className='font-medium text-primary'>
								{loading || !allPricesLoaded ? (
									<Skeleton className='w-28 h-4' />
								) : (
									`IDR ${finalPrice.toLocaleString('id-ID')}`
								)}
							</div>
						</div>

						<Separator className='bg-secondary my-3' />
						<div className='flex justify-between font-semibold text-md'>
							<p className='text-sm'>Total Price</p>
							<div className='text-primary'>
								{loading || !allPricesLoaded ? (
									<Skeleton className='w-32 h-5' />
								) : (
									`IDR ${finalPrice.toLocaleString('id-ID')}`
								)}
							</div>
						</div>
					</div>
				)}

				<Button
					className='bg-primary mt-4 py-2 rounded-lg w-full text-primary-foreground'
					onClick={handleRequestBook}
					disabled={selectedTents.length === 0 || loading || !allPricesLoaded}
				>
					{loading || !allPricesLoaded
						? 'Calculating Price...'
						: selectedTents.length === 0
						? 'Select a Tent to Book'
						: 'Request To Book'}
				</Button>
			</CardContent>
		</Card>
	);
}
