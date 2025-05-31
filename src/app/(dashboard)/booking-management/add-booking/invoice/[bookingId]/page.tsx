/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import InvoiceDetail from '@/components/pages/booking-management/add-booking/invoice/invoice-detail';
import { Button } from '@/components/ui/button';
import { Confetti } from '@/components/ui/confetti';
import { useHydration } from '@/hooks/use-hydration';
import { useReservationStore } from '@/stores/use-reservation-store';
import { useBookings } from '@/hooks/bookings/use-bookings';
import { Booking } from '@/types/booking';

export default function InvoicePage() {
	const params = useParams();
	const bookingId = params.bookingId as string;
	const [loading, setLoading] = useState(true);
	const isHydrated = useHydration();
	const [showConfetti, setShowConfetti] = useState(true);
	const [fetchedBooking, setFetchedBooking] = useState<Booking | null>(null);

	const {
		reservationDataStore,
		personalInfo,
		bookingResponseData,
		paymentData,
	} = useReservationStore();

	const { getBookingById } = useBookings();

	useEffect(() => {
		if (!isHydrated) return;

		const fetchBookingData = async () => {
			// Check if we have all required data from the store
			const hasStoreData =
				reservationDataStore &&
				personalInfo &&
				bookingResponseData &&
				paymentData;

			if (!hasStoreData) {
				console.log('Missing store data, fetching booking from API...');
				try {
					const booking = await getBookingById(bookingId);
					if (booking) {
						setFetchedBooking(booking);
					} else {
						console.error('Failed to fetch booking data');
					}
				} catch (error) {
					console.error('Error fetching booking:', error);
				}
			}

			setLoading(false);
		};

		fetchBookingData();
	}, [
		isHydrated,
		reservationDataStore,
		personalInfo,
		bookingResponseData,
		paymentData,
		bookingId,
		getBookingById,
	]);

	const handleDownload = () => {
		alert('Download functionality will be implemented here');
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<div className='border-b-4 border-blue-500 rounded-full w-16 h-16 animate-spin'></div>
			</div>
		);
	}

	// Use store data if available, otherwise use fetched booking data
	const useStoreData =
		reservationDataStore && personalInfo && bookingResponseData && paymentData;

	let invoiceData;

	if (useStoreData) {
		// Use data from store (normal flow)
		const formattedCheckInDate = reservationDataStore?.checkInDate
			? format(new Date(reservationDataStore.checkInDate), 'EEE, MMM dd yyyy')
			: 'N/A';

		const formattedCheckOutDate = reservationDataStore?.checkOutDate
			? format(new Date(reservationDataStore.checkOutDate), 'EEE, MMM dd yyyy')
			: 'N/A';

		const paymentDate = paymentData?.payment?.created_at
			? format(new Date(paymentData.payment.created_at), 'MMMM d, yyyy')
			: 'N/A';

		const tents =
			reservationDataStore?.selectedTents?.map((tent) => ({
				id: tent.id,
				name: tent.name,
				image: tent.tent_images[0],
				category: tent.category?.name || 'Standard',
				capacity: tent.capacity,
				price: tent.api_price || tent.weekend_price || 0,
			})) || [];

		invoiceData = {
			bookingId,
			paymentDate,
			guestName: personalInfo?.name || '',
			guestEmail: personalInfo?.email || '',
			guestPhone: personalInfo?.phone || '',
			guestCount: personalInfo?.guestCount || '1',
			external: personalInfo?.external || '',
			checkInDate: formattedCheckInDate,
			checkOutDate: formattedCheckOutDate,
			tents,
			totalPrice: reservationDataStore?.totalPrice || 0,
		};
	} else if (fetchedBooking) {
		// Use data from API (fallback when store is empty)
		const formattedCheckInDate = format(
			new Date(fetchedBooking.start_date),
			'EEE, MMM dd yyyy',
		);
		const formattedCheckOutDate = format(
			new Date(fetchedBooking.end_date),
			'EEE, MMM dd yyyy',
		);
		const paymentDate = format(
			new Date(fetchedBooking.created_at),
			'MMMM d, yyyy',
		);

		const tents =
			fetchedBooking.detail_booking?.map((detail) => ({
				id: detail.reservation.tent.id,
				name: detail.reservation.tent.name,
				image: detail.reservation.tent.tent_image || '/tent-image.jpg',
				category: detail.reservation.tent.category?.name || 'Standard',
				capacity: detail.reservation.tent.category?.facilities
					? Object.keys(detail.reservation.tent.category.facilities).length
					: 2,
				price: detail.reservation.price,
			})) || [];

		invoiceData = {
			bookingId,
			paymentDate,
			guestName: fetchedBooking.guest?.name || '',
			guestEmail: fetchedBooking.guest?.email || '',
			guestPhone: fetchedBooking.guest?.phone || '',
			guestCount: '1', // Default since we don't have this in booking data
			external: 'Direct', // Default since we don't have this in booking data
			checkInDate: formattedCheckInDate,
			checkOutDate: formattedCheckOutDate,
			tents,
			totalPrice: fetchedBooking.total_amount,
		};
	} else {
		// No data available
		return (
			<div className='flex flex-col justify-center items-center h-screen'>
				<h1 className='mb-4 font-bold text-red-600 text-2xl'>
					Invoice Not Found
				</h1>
				<p className='mb-4 text-gray-600'>
					Unable to load invoice data for booking ID: {bookingId}
				</p>
				<Button asChild>
					<Link href='/booking-management'>Back to Bookings</Link>
				</Button>
			</div>
		);
	}

	return (
		<>
			{showConfetti && useStoreData && (
				<Confetti
					style={{
						position: 'fixed',
						width: '100%',
						height: '100%',
						zIndex: 100,
						pointerEvents: 'none',
					}}
					options={{
						particleCount: 100,
						spread: 70,
						origin: { y: 0.3 },
					}}
				/>
			)}

			<div className='mx-auto my-24 px-4 container'>
				<InvoiceDetail {...invoiceData} onDownload={handleDownload} />
			</div>
		</>
	);
}
