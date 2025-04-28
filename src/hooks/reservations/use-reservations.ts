import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { create } from 'zustand';

import api from '@/lib/api';
import {
	PriceCheckResponse,
	ReservationRequest,
	ReservationResponse,
	ReservationStore,
	responseArray,
} from '@/types/reservations';

export const useReservations = create<ReservationStore>((set) => ({
	date: {
		from: undefined,
		to: undefined,
	},
	reservationData: null,
	loading: false,
	error: null,
	showResults: false,
	selectedCategory: 'All',

	setDate: (date: DateRange | undefined) => set({ date }),

	setSelectedCategory: (category: string) =>
		set({ selectedCategory: category }),

	handleSearch: async (onError: (message: string) => void) => {
		const state = useReservations.getState();

		if (!state.date?.from || !state.date?.to) {
			onError('Please select a date range');
			return;
		}

		set({ loading: true, error: null, showResults: false });

		try {
			const start_date = format(state.date.from, 'yyyy-MM-dd');
			const end_date = format(state.date.to, 'yyyy-MM-dd');

			const params: Record<string, string> = {
				start_date,
				end_date,
			};

			if (state.selectedCategory !== 'All') {
				params.name = state.selectedCategory;
			}

			const response = await api.get<responseArray>(
				'/reservations/availability',
				{ params },
			);
			set({
				reservationData: response.data.data,
				showResults: response.data.data.length > 0,
			});
			console.log(response.data.data);
		} catch (err: unknown) {
			onError(err instanceof Error ? err.message : 'Something went wrong');
			set({ showResults: false });
		} finally {
			set({ loading: false });
		}
	},

	createReservation: async (
		data: ReservationRequest,
	): Promise<ReservationResponse> => {
		try {
			const response = await api.post<ReservationResponse>(
				'/reservations',
				data,
			);
			return response.data;
		} catch (error) {
			throw error instanceof Error
				? error
				: new Error('Failed to create reservation');
		}
	},

	checkPrice: async (
		tentIds: string[],
		startDate: Date,
		endDate: Date,
	): Promise<PriceCheckResponse | null> => {
		try {
			const start = format(startDate, 'yyyy-MM-dd');
			const end = format(endDate, 'yyyy-MM-dd');

			const response = await api.post<PriceCheckResponse>(
				'/reservations/price',
				{
					tent_id: tentIds,
					start_date: start,
					end_date: end,
				},
			);

			return response.data;
		} catch (error) {
			console.error('Error checking price:', error);
			return null;
		}
	},
}));
