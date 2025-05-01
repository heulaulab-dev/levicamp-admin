/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/auth/useAuth';
import {
	BookingState,
	Booking,
	AddOn,
	PaginationOptions,
} from '@/types/booking';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

// Create and export the Zustand store
export const useBookingsStore = create<BookingState>((set, get) => {
	// Define the fetch function outside the store methods
	const fetchBookings = async (options?: PaginationOptions) => {
		// If we're already fetching, don't start another request
		if (isFetching) {
			return;
		}

		isFetching = true;
		set({ isLoading: true });
		const currentToken = useAuthStore.getState().token;

		try {
			const response = await api.get('/bookings', {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
				params: {
					page: options?.page || 1,
					pageSize: options?.page_size || 10,
					search: options?.search,
					status: options?.status,
				},
			});

			// Store the response data
			const responseData = response.data;

			// Check if the response is valid
			if (responseData && responseData.data) {
				set({
					bookings: responseData.data,
					pagination: responseData.pagination,
					isLoading: false,
				});
			} else {
				console.error('Unexpected API response format:', responseData);
				toast.error('Invalid response format from server');
			}
		} catch (error) {
			console.error('Error fetching bookings:', error);
			const errorDescription = (error as any).response?.data?.error
				?.description;
			const errorMessage =
				errorDescription ||
				(error as any).response?.data?.message ||
				'Failed to fetch bookings';
			set({ isLoading: false });
			toast.error(errorMessage);
		} finally {
			set({ isLoading: false });
			isFetching = false;
		}
	};

	// Helper function to handle API errors
	const handleApiError = (error: any, defaultMessage: string) => {
		console.error(`Error: ${defaultMessage}`, error);
		const errorDescription = error.response?.data?.error?.description;
		const errorMessage =
			errorDescription || error.response?.data?.message || defaultMessage;

		if (error.response?.status === 429) {
			toast.error('Too many requests. Please try again later.');
		} else {
			toast.error(errorMessage);
		}

		set({ isLoading: false });
		return null;
	};

	// Helper function to make authenticated API calls
	const makeAuthenticatedRequest = async (
		method: 'get' | 'put' | 'patch',
		endpoint: string,
		data?: any,
	) => {
		const currentToken = useAuthStore.getState().token;
		const config = {
			headers: {
				Authorization: `Bearer ${currentToken}`,
			},
		};

		try {
			set({ isLoading: true });
			const response = await (method === 'get'
				? api.get(endpoint, config)
				: method === 'put'
				? api.put(endpoint, data, config)
				: api.patch(endpoint, data, config));

			set({ isLoading: false });
			return response.data;
		} catch (error: any) {
			return handleApiError(error, `Failed to ${method} ${endpoint}`);
		}
	};

	// Helper function to format date to YYYY-MM-DD
	const formatDate = (dateString: string) => {
		return dateString.split('T')[0];
	};

	return {
		// State
		bookings: [],
		isLoading: false,
		pagination: null,
		selectedBooking: null,

		// Get bookings data from API with duplicate request prevention
		getBookings: async (options?: PaginationOptions) => {
			return fetchBookings(options);
		},

		// Get a single booking by ID
		getBookingById: async (id: string) => {
			const response = await makeAuthenticatedRequest('get', `/bookings/${id}`);
			if (response) {
				set({ selectedBooking: response.data });
				return response.data;
			}
			return null;
		},

		// Update a booking
		updateBooking: async (id: string, data: Partial<Booking>) => {
			// Get the current booking to preserve existing data
			const currentBooking = get().bookings.find(
				(booking) => booking.id === id,
			);

			if (!currentBooking) {
				toast.error('Booking not found');
				return null;
			}

			// Create update data with formatted dates
			const { start_date, end_date, ...otherData } = data;
			const updateData = {
				...otherData,
				start_date: formatDate(start_date || currentBooking.start_date),
				end_date: formatDate(end_date || currentBooking.end_date),
				total_amount: data.total_amount || currentBooking.total_amount,
			};

			const response = await makeAuthenticatedRequest(
				'put',
				`/bookings/${id}`,
				updateData,
			);
			if (response) {
				// Refresh the bookings list to show updated data
				await fetchBookings();
				toast.success('Booking updated successfully');
				return response.data;
			}
			return null;
		},

		// Update booking add-ons
		updateBookingAddOns: async (id: string, addOns: AddOn[]) => {
			const response = await makeAuthenticatedRequest(
				'put',
				`/bookings/${id}`,
				{ add_ons: addOns },
			);
			if (response) {
				await fetchBookings();
				toast.success('Booking add-ons updated successfully');
				return response.data;
			}
			return null;
		},

		// Check in a booking
		checkInBooking: async (id: string) => {
			// Get the current booking to check status
			const currentBooking = get().bookings.find(
				(booking) => booking.id === id,
			);

			if (!currentBooking) {
				toast.error('Booking not found');
				return null;
			}

			if (currentBooking.status !== 'confirmed') {
				toast.error('Only confirmed bookings can be checked in');
				return null;
			}

			const response = await makeAuthenticatedRequest(
				'patch',
				`/bookings/${id}/check-in`,
			);
			if (response) {
				await fetchBookings();
				toast.success('Guest checked in successfully');
				return response.data;
			}
			return null;
		},

		// Check out a booking
		checkOutBooking: async (id: string) => {
			const response = await makeAuthenticatedRequest(
				'patch',
				`/bookings/${id}/check-out`,
			);
			if (response) {
				await fetchBookings();
				toast.success('Guest checked out successfully');
				return response.data;
			}
			return null;
		},

		// Reset bookings state
		resetBookings: () => {
			set({
				bookings: [],
				pagination: null,
				selectedBooking: null,
			});
		},
	};
});
