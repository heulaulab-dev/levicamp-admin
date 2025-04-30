'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { useReservations } from '@/hooks/reservations/use-reservations';
import { Label } from '@/components/ui/label';
import { useCategory } from '@/hooks/category/useCategory';
import { useEffect } from 'react';
import DateRangePicker from '@/components/pages/booking-management/add-booking/date-picker';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TentCollection from '@/components/pages/booking-management/add-booking/tent-collection';
import { useReservationStore } from '@/stores/use-reservation-store';
import {
	PersonalInfoCard,
	PersonalInfoData,
} from '@/components/pages/booking-management/add-booking/personal-card';
import { ReservationSummary } from '@/components/pages/booking-management/add-booking/reservation-summary';
import { useHydration } from '@/hooks/use-hydration';
import { CheckPersonalCard } from '@/components/pages/booking-management/add-booking/check-detail/check-personal-card';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function AddBookingPage() {
	const router = useRouter();
	const {
		date,
		setDate,
		loading,
		error,
		handleSearch,
		showResults,
		reservationData,
		selectedCategory,
		createReservation,
		checkPrice,
	} = useReservations();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Use Zustand store
	const {
		personalInfo,
		hasSubmittedPersonalInfo,
		setPersonalInfo,
		reservationDataStore,
		setReservationData,
		setBookingResponseData,
	} = useReservationStore();

	const {
		categories,
		getCategories,
		isLoading: categoriesLoading,
	} = useCategory();

	const [checkDetail, setCheckDetail] = useState(false);

	const isHydrated = useHydration();

	// Fetch categories when component mounts
	useEffect(() => {
		if (categories.length === 0) getCategories();
	}, [getCategories, categories.length]);

	const [tempSelectedCategory, setTempSelectedCategory] =
		useState(selectedCategory);

	const handlePersonalInfoSubmit = (data: PersonalInfoData) => {
		// Save to Zustand store with persist
		setPersonalInfo(data);
		toast.success('Personal information submitted successfully');
	};

	const handleRequestToBook = () => {
		setCheckDetail(true);
	};

	// Fetch prices from API when page loads
	useEffect(() => {
		if (!reservationDataStore || !isHydrated) return;

		const fetchPrices = async () => {
			if (
				reservationDataStore.selectedTents.length > 0 &&
				reservationDataStore.checkInDate &&
				reservationDataStore.checkOutDate
			) {
				try {
					// Get all tent IDs
					const tentIds = reservationDataStore.selectedTents.map(
						(tent) => tent.id,
					);

					// Fetch prices from API
					const priceData = await checkPrice(
						tentIds,
						reservationDataStore.checkInDate,
						reservationDataStore.checkOutDate,
					);

					if (priceData && priceData.data) {
						// Create a map of tent IDs to their API prices
						const priceMap: Record<string, number> = {};
						priceData.data.tents.forEach((t: { id: string; price: number }) => {
							priceMap[t.id] = t.price;
						});

						// Update tent data with API prices
						const updatedTents = reservationDataStore.selectedTents.map(
							(tent) => ({
								...tent,
								api_price: priceMap[tent.id],
							}),
						);

						// Update reservation data with API prices and total
						setReservationData({
							...reservationDataStore,
							selectedTents: updatedTents,
							totalPrice: priceData.data.total_price,
							isLoadingPrices: false,
						});
					}
				} catch (error) {
					console.error('Failed to fetch prices:', error);
					// Set loading to false even if there was an error
					setReservationData({
						...reservationDataStore,
						isLoadingPrices: false,
					});
				}
			}
		};

		if (reservationDataStore.isLoadingPrices) {
			fetchPrices();
		}
	}, [reservationDataStore, checkPrice, setReservationData, isHydrated]);

	const handleBooking = async () => {
		try {
			setIsSubmitting(true);

			if (
				!reservationDataStore?.checkInDate ||
				!reservationDataStore?.checkOutDate
			) {
				toast.error('Invalid booking dates');
				return;
			}

			if (!personalInfo) {
				toast.error('Personal information not found');
				return;
			}

			const reservationRequest = {
				name: personalInfo.name,
				email: personalInfo.email,
				phone: personalInfo.phone,
				address: personalInfo.address,
				external: personalInfo.external,
				tent_id: reservationDataStore.selectedTents.map((tent) => tent.id),
				start_date: format(reservationDataStore.checkInDate, 'yyyy-MM-dd'),
				end_date: format(reservationDataStore.checkOutDate, 'yyyy-MM-dd'),
			};

			const response = await createReservation(reservationRequest);

			// Store the reservation response in the Zustand store instead of localStorage
			setBookingResponseData(response);
			const bookingId = response.data.booking.id;
			router.push(`/booking-management/add-booking/invoice/${bookingId}`);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to create reservation',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const showResultsRef = useRef<HTMLDivElement>(null);
	const showPersonalDetailRef = useRef<HTMLDivElement>(null);
	const showCheckDetailRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (showResults) {
			setTimeout(() => {
				showResultsRef.current?.scrollIntoView({ behavior: 'smooth' });
			}, 100);
		}

		if (reservationDataStore) {
			setTimeout(() => {
				showPersonalDetailRef.current?.scrollIntoView({ behavior: 'smooth' });
			}, 100);
		}

		if (checkDetail) {
			setTimeout(() => {
				showCheckDetailRef.current?.scrollIntoView({ behavior: 'smooth' });
			}, 100); 
		}
	}, [showResults, reservationDataStore, checkDetail]);

	const handleChangePersonalInfoSubmit = () => {
		setCheckDetail(false);
	};

	return (
		<div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
			<PageHeader title='Add Booking' />
			<Card>
				<CardHeader>
					{' '}
					<CardTitle className='font-semibold text-lg'>
						Informasi Tenda
					</CardTitle>
				</CardHeader>
				<CardContent className='flex flex-col gap-4'>
					<div className='flex flex-row justify-between gap-10 w-full'>
						<div className='flex flex-col gap-1 w-full'>
							<Label className='font-semibold text-secondary-foreground text-sm'>
								Category
							</Label>
							<p className='font-medium text-secondary-foreground text-sm'>
								Pilih Kategori Tenda
							</p>
						</div>
						<Select
							onValueChange={setTempSelectedCategory}
							required
							value={tempSelectedCategory || ''} // Use empty string when no value is selected
						>
							<SelectTrigger className='w-full'>
								<SelectValue
									placeholder={
										categoriesLoading
											? 'Loading categories...'
											: categories.length === 0
											? 'No categories available'
											: 'Select a category'
									}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className='flex flex-row justify-between gap-10 w-full'>
						<div className='flex flex-col gap-1 w-full'>
							<Label className='font-semibold text-secondary-foreground text-sm'>
								Date
							</Label>
							<p className='font-medium text-secondary-foreground text-sm'>
								Pilih Tanggal untuk Booking
							</p>
						</div>
						<DateRangePicker
							date={date}
							setDate={setDate}
							label='Booking Date'
						/>
					</div>
					<div className='flex w-full'>
						<Button
							className='w-full'
							disabled={loading}
							onClick={() => {
								handleSearch((message) => {
									alert(message);
								});
							}}
						>
							{loading ? 'Loading...' : 'Cari Tenda Tersedia'}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Search Results Section */}
			{showResults && (
				<Card ref={showResultsRef} className='p-8'>
					{loading && 'Loading...'}
					{error && toast.error(error)}
					{!loading && !error && showResults && (
						<TentCollection
							categories={(reservationData ?? []).filter(
								(category) =>
									selectedCategory === 'All' ||
									category.name === selectedCategory,
							)}
							loading={loading}
							error={error}
							checkInDate={date?.from}
							checkOutDate={date?.to}
						/>
					)}
				</Card>
			)}

			{reservationDataStore && (
				<Card ref={showPersonalDetailRef}>
					<CardHeader>
						<CardTitle className='font-semibold text-lg'>
							Personal Detail
						</CardTitle>
						<CardContent className='flex flex-col gap-4'>
							<div className='gap-8 grid grid-cols-1 lg:grid-cols-6 pb-12'>
								{/* Personal Information Form */}
								<div className='lg:col-span-4'>
									<PersonalInfoCard
										onSubmit={handlePersonalInfoSubmit}
										initialData={personalInfo || undefined}
									/>
								</div>

								{/* Reservation Summary */}
								<div className='lg:col-span-2'>
									{reservationDataStore && (
										<ReservationSummary
											data={reservationDataStore}
											onContinue={handleRequestToBook}
											showButtons={true}
											showBackButton={false}
											showContinueButton={true}
											backButtonText='Back'
											continueButtonText='Request to Book'
											disableContinue={!hasSubmittedPersonalInfo}
										/>
									)}
								</div>
							</div>
						</CardContent>
					</CardHeader>
				</Card>
			)}

			{checkDetail && (
				<Card ref={showCheckDetailRef}>
					<CardContent className='p-4'>
						<div className='gap-8 grid grid-cols-1 lg:grid-cols-6'>
							{/* Personal Information Form */}
							<div className='lg:col-span-4'>
								<CheckPersonalCard />
							</div>

							{/* Reservation Summary */}
							<div className='lg:col-span-2'>
								{reservationDataStore && (
									<ReservationSummary
										data={reservationDataStore}
										showButtons={true}
										showBackButton={true}
										showContinueButton={true}
										onContinue={handleBooking}
										onBack={handleChangePersonalInfoSubmit}
										backButtonText='Change Personal Info'
										continueButtonText='Booking Tent'
										isLoading={isSubmitting}
									/>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
