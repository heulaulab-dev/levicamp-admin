/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { PaymentDetails } from '@/types/payments';

export interface PersonalInfoData {
	name: string;
	phone: string;
	email: string;
	guestCount: string;
	address: string;
	source: string;
	agreeToTerms: boolean;
	agreeToPrivacy: boolean;
}

export interface ReservationData {
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
}

interface ReservationStore {
	// Reservation data
	reservationDataStore: ReservationData | null;
	setReservationData: (data: ReservationData) => void;
	clearReservationData: () => void;

	// Personal info
	personalInfo: PersonalInfoData | null;
	setPersonalInfo: (data: PersonalInfoData) => void;
	clearPersonalInfo: () => void;
	hasSubmittedPersonalInfo: boolean;
	setHasSubmittedPersonalInfo: (value: boolean) => void;

	// Payment data
	paymentData: PaymentDetails | null;
	setPaymentData: (data: PaymentDetails) => void;
	clearPaymentData: () => void;

	// Booking response data
	bookingResponseData: any | null;
	setBookingResponseData: (data: any) => void;
	clearBookingResponseData: () => void;
}

export const useReservationStore = create<ReservationStore>()(
	persist(
		(set) => ({
			// Reservation data
			reservationDataStore: null,
			setReservationData: (data) => set({ reservationDataStore: data }),
			clearReservationData: () => set({ reservationDataStore: null }),

			// Personal info
			personalInfo: null,
			setPersonalInfo: (data) =>
				set({
					personalInfo: data,
					hasSubmittedPersonalInfo: true,
				}),
			clearPersonalInfo: () =>
				set({
					personalInfo: null,
					hasSubmittedPersonalInfo: false,
				}),
			hasSubmittedPersonalInfo: false,
			setHasSubmittedPersonalInfo: (value) =>
				set({ hasSubmittedPersonalInfo: value }),

			// Payment data
			paymentData: null,
			setPaymentData: (data) => set({ paymentData: data }),
			clearPaymentData: () => set({ paymentData: null }),

			// Booking response data
			bookingResponseData: null,
			setBookingResponseData: (data) => set({ bookingResponseData: data }),
			clearBookingResponseData: () => set({ bookingResponseData: null }),
		}),
		{
			name: 'reservation-storage',
			partialize: (state) => ({
				reservationData: state.reservationDataStore,
				personalInfo: state.personalInfo,
				hasSubmittedPersonalInfo: state.hasSubmittedPersonalInfo,
				paymentData: state.paymentData,
				bookingResponseData: state.bookingResponseData,
			}),
		},
	),
);
