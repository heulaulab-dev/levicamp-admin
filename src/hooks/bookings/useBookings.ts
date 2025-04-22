import { create } from 'zustand';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/hooks/auth/useAuth';
import {
	BookingResponse,
	BookingsResponse,
	BookingState,
	UpdateBookingRequest,
	UpdateAddonsRequest,
	PaginationOptions,
} from '@/types/booking';
import { AxiosError } from 'axios';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

export const useBookings = create<BookingState>((set, get) => {
	const fetchBookings = async (options?: PaginationOptions) => {
		const page = options?.page || 1;
		const pageSize = options?.per_page || 10;

		if (isFetching) return;

		isFetching = true;
		set({ isLoading: true });
		const currentToken = useAuthStore.getState().token;

		let retries = 3;
		const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

		while (retries > 0) {
			try {
				const response = await api.get('/bookings', {
					headers: {
						Authorization: `Bearer ${currentToken}`,
					},
					params: {
						page,
						pageSize,
						...(options?.search && { search: options.search }),
						...(options?.status && { status: options.status }),
					},
				});

				const responseData = response.data as BookingsResponse;

				if (responseData && responseData.data) {
					set({
						bookings: responseData.data,
						pagination: {
							total: responseData.pagination.totalItems,
							page: responseData.pagination.page,
							pageSize: responseData.pagination.pageSize,
						},
						isLoading: false,
					});
					return;
				} else {
					toast.error('Invalid response format from server');
					break;
				}
			} catch (error) {
				const typedError = error as AxiosError<{ message?: string }>;
				if (typedError.response?.status === 429) {
					console.log('Rate limit hit. Retrying...');
					retries--;
					await delay(1000 * Math.pow(2, 3 - retries)); // 1s → 2s → 4s
					continue;
				}

				const msg =
					typedError.response?.data?.message || 'Failed to fetch bookings';
				toast.error(msg);
				break;
			}
		}

		// fallback state
		set({
			bookings: [],
			pagination: { total: 0, page, pageSize },
			isLoading: false,
		});
		isFetching = false;
	};

	// Helper function to handle API errors
	const handleApiError = (
		error: AxiosError<{ error?: { description?: string }; message?: string }>,
		defaultMessage: string,
		showToast = true,
	) => {
		console.error(`Error: ${defaultMessage}`, error);
		const errorDescription = error.response?.data?.error?.description;
		const errorMessage =
			errorDescription || error.response?.data?.message || defaultMessage;

		if (error.response?.status === 429) {
			console.log('Rate limit exceeded');
			if (showToast) {
				toast.error('Too many requests. Please try again later.');
			}
		} else {
			toast.error(errorMessage);
		}

		set({ isLoading: false });
		return null;
	};

	// Helper function to make authenticated API requests
	const makeAuthenticatedRequest = async <T>(
		method: 'get' | 'put' | 'post' | 'patch',
		endpoint: string,
		data?: unknown,
	): Promise<T | null> => {
		const currentToken = useAuthStore.getState().token;
		const config = {
			headers: {
				Authorization: `Bearer ${currentToken}`,
			},
		};

		try {
			set({ isLoading: true });
			let response;

			switch (method) {
				case 'get':
					response = await api.get(endpoint, config);
					break;
				case 'put':
					response = await api.put(endpoint, data, config);
					break;
				case 'post':
					response = await api.post(endpoint, data, config);
					break;
				case 'patch':
					response = await api.patch(endpoint, data, config);
					break;
			}

			set({ isLoading: false });
			return response.data as T;
		} catch (error) {
			return handleApiError(
				error as AxiosError<{
					error?: { description?: string };
					message?: string;
				}>,
				`Failed to ${method} ${endpoint}`,
				false,
			);
		}
	};

	return {
		// State
		bookings: [],
		isLoading: false,
		pagination: null,
		selectedBooking: null,

		// Get all bookings with pagination
		getBookings: async (options?: PaginationOptions) => {
			await fetchBookings(options);
		},

		// Get a single booking by ID
		getBookingById: async (id: string) => {
			const response = await makeAuthenticatedRequest<BookingResponse>(
				'get',
				`/bookings/${id}`,
			);

			if (response && response.data) {
				set({ selectedBooking: response.data });
				return response.data;
			}

			return null;
		},

		// Update a booking by ID
		updateBooking: async (id: string, data: UpdateBookingRequest) => {
			const response = await makeAuthenticatedRequest<BookingResponse>(
				'put',
				`/bookings/${id}`,
				data,
			);

			if (response && response.data) {
				// Update the selected booking
				set({ selectedBooking: response.data });

				// Also update this booking in the bookings list if it exists there
				const { bookings } = get();
				const updatedBookings = bookings.map((booking) =>
					booking.id === id ? response.data : booking,
				);

				set({ bookings: updatedBookings });

				toast.success('Booking updated successfully');
				return response.data;
			}

			return null;
		},

		// Update booking addons by ID
		updateBookingAddOns: async (id: string, addOns: UpdateAddonsRequest) => {
			const response = await makeAuthenticatedRequest<BookingResponse>(
				'post',
				`/bookings/${id}/addons`,
				addOns,
			);

			if (response && response.data) {
				// Update the selected booking
				set({ selectedBooking: response.data });

				// Also update this booking in the bookings list if it exists there
				const { bookings } = get();
				const updatedBookings = bookings.map((booking) =>
					booking.id === id ? response.data : booking,
				);

				set({ bookings: updatedBookings });

				toast.success('Booking addons updated successfully');
				return response.data;
			}

			return null;
		},

		// Check in a booking
		checkInBooking: async (id: string) => {
			const response = await makeAuthenticatedRequest<BookingResponse>(
				'patch',
				`/bookings/${id}/check-in`,
			);

			if (response && response.data) {
				// Update the selected booking
				set({ selectedBooking: response.data });

				// Also update this booking in the bookings list if it exists there
				const { bookings } = get();
				const updatedBookings = bookings.map((booking) =>
					booking.id === id ? response.data : booking,
				);

				set({ bookings: updatedBookings });

				toast.success('Booking checked in successfully');
				return response.data;
			}

			return null;
		},

		// Check out a booking
		checkOutBooking: async (id: string) => {
			const response = await makeAuthenticatedRequest<BookingResponse>(
				'patch',
				`/bookings/${id}/check-out`,
			);

			if (response && response.data) {
				// Update the selected booking
				set({ selectedBooking: response.data });

				// Also update this booking in the bookings list if it exists there
				const { bookings } = get();
				const updatedBookings = bookings.map((booking) =>
					booking.id === id ? response.data : booking,
				);

				set({ bookings: updatedBookings });

				toast.success('Booking checked out successfully');
				return response.data;
			}

			return null;
		},

		// Reset booking state
		resetBookings: () => {
			set({
				bookings: [],
				selectedBooking: null,
				pagination: null,
			});
		},
	};
});
