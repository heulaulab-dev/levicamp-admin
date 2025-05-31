'use client';

import { Award, Grid, Star, Tent as TentIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import CardTent from '@/components/pages/booking-management/add-booking/card-tent';
import SummaryTent from '@/components/pages/booking-management/add-booking/summary-tent';
import { useReservationStore } from '@/stores/use-reservation-store';
import { Category, Tent } from '@/types/reservations';

interface TentCollectionProps {
	categories:
		| {
				id: string;
				name: string;
				status?: string;
				tents: Tent[];
		  }[]
		| null;
	loading: boolean;
	error: string | null;
	checkInDate?: Date;
	checkOutDate?: Date;
}

export default function TentCollection({
	loading,
	error,
	categories,
	checkInDate,
	checkOutDate,
}: TentCollectionProps) {
	const [selectedTentIds, setSelectedTentIds] = useState<string[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>('All');

	// Add Zustand store
	const {
		setReservationData,
		clearReservationData,
		clearPersonalInfo,
		clearPaymentData,
		clearBookingResponseData,
	} = useReservationStore();

	// Rename to avoid confusion with the later reservationData object
	const categoriesData = categories ?? [];
	const filteredCategories =
		selectedCategory === 'All'
			? categoriesData
			: categoriesData.filter((category) => category.name === selectedCategory);

	const handleSelectTent = (tentId: string) => {
		setSelectedTentIds((prev) => {
			return prev.includes(tentId)
				? prev.filter((id) => id !== tentId) // Remove if already selected
				: [...prev, tentId]; // Add if not selected
		});
	};

	const handleRemoveTent = (tentId: string) => {
		setSelectedTentIds((prev) => prev.filter((id) => id !== tentId));
	};

	// Get all selected tents with their full data
	const selectedTents = selectedTentIds
		.map((id) => {
			const tent = (categories ?? [])
				.flatMap((category) => category.tents)
				.find((tent) => tent.id === id);

			if (!tent) return null;

			// Create a new tent object with required fields
			const defaultCategory: Category = {
				id: tent.category_id,
				name:
					(categories ?? []).find((c) => c.id === tent.category_id)?.name ??
					'Unknown',
				price: 0,
				description: '',
				tents: [],
			};

			const tentWithCategory: Tent = {
				...tent,
				category: tent.category ?? defaultCategory,
			};

			return tentWithCategory;
		})
		.filter((tent): tent is NonNullable<typeof tent> => tent !== null);

	const handleRequestBook = () => {
		// Validate that tents are selected
		if (selectedTents.length === 0) {
			toast.error('Please select at least one tent before proceeding.');
			return;
		}

		// Validate dates
		if (!checkInDate || !checkOutDate) {
			toast.error('Please select valid check-in and check-out dates.');
			return;
		}

		if (checkInDate >= checkOutDate) {
			toast.error('Check-out date must be after check-in date.');
			return;
		}

		// Clear all previous data from store
		clearReservationData();
		clearPersonalInfo();
		clearPaymentData();
		clearBookingResponseData();

		// Get prices from the SummaryTent component
		const tentsWithApiPrices = selectedTents.map((tent) => {
			return {
				...tent,
				api_price: undefined,
			};
		});

		// Create reservation data
		const reservationData = {
			selectedTents: tentsWithApiPrices,
			checkInDate,
			checkOutDate,
			totalPrice: 0,
			isLoadingPrices: true,
		};

		// Save to Zustand store instead of localStorage
		setReservationData(reservationData);

		// Show success toast
		toast.success('Great choice! Please fill in your details to continue.');

	};

	return (
		<div className='flex md:flex-row flex-col gap-10'>
			{/* SECTION KIRI */}
			<div className='flex flex-col gap-6 w-full md:w-2/3'>
				{/* Header Section */}
				<div className='relative flex justify-between items-center'>
					<div className='flex items-center gap-2 bg-primary/10 shadow-md px-5 py-2.5 rounded-lg text-primary'>
						<Award className='w-5 h-5' />
						<span>Our Tent Category</span>
					</div>
					<div className='flex items-center gap-2 bg-primary/10 shadow-md p-1 rounded-lg'>
						{[
							{ name: 'All', icon: <Grid className='w-4 h-4' /> },
							{ name: 'Standard', icon: <TentIcon className='w-4 h-4' /> },
							{ name: 'VIP', icon: <Star className='w-4 h-4' /> },
						].map((category) => (
							<button
								key={category.name}
								className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ease-in-out ${
									selectedCategory === category.name
										? 'bg-primary text-primary-foreground shadow-md'
										: 'bg-transparent text-secondary-foreground dark:text-primary-foreground  hover:bg-primary/50 hover:text-primary-foreground'
								}`}
								onClick={() => setSelectedCategory(category.name)}
							>
								{category.icon}
								{category.name}
							</button>
						))}
					</div>
				</div>

				{/* Loading & Error Handling */}
				{loading && <p className='text-center'>Loading reservations...</p>}
				{error && <p className='text-red-500 text-center'>{error}</p>}

				{/* Tent List */}
				{!loading && !error && (
					<div>
						{filteredCategories.length > 0 ? (
							<div className='gap-5 grid grid-cols-1 md:grid-cols-3 w-full'>
								{filteredCategories.flatMap((category) =>
									category.tents.map((tent) => (
										<CardTent
											key={tent.id}
											status={
												category.id === 'unavailable' ||
												tent.status === 'unavailable' ||
												tent.status === 'maintenance'
													? 'unavailable'
													: 'available'
											}
											tent={{
												...tent,
												category: tent.category ?? {
													id: category.id,
													name: category.name,
													price: 0,
													description: '',
													tents: [],
												},
											}}
											isSelected={selectedTentIds.includes(tent.id)}
											onSelect={() => handleSelectTent(tent.id)}
										/>
									)),
								)}
							</div>
						) : (
							<div className='py-8 text-muted-foreground text-center'>
								<TentIcon className='opacity-50 mx-auto mb-2 w-12 h-12' />
								<p>No tents Available</p>
								<p className='mt-1 text-sm'>
									Please select another category or date
								</p>
							</div>
						)}
					</div>
				)}
			</div>

			{/* SECTION KANAN (Summary Card) */}
			<div className='w-full md:w-1/3'>
				<SummaryTent
					selectedTents={selectedTents}
					onRemove={handleRemoveTent}
					checkInDate={checkInDate}
					checkOutDate={checkOutDate}
					onRequestBook={handleRequestBook}
				/>
			</div>
		</div>
	);
}
