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
	UpdateBookingStatusRequest,
	PaginationOptions,
} from '@/types/booking';
import { AxiosError } from 'axios';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

export const useBookings = create<BookingState>((set, get) => {
	const fetchBookings = async (options?: PaginationOptions) => {
		// Prevent duplicate requests if a request is already in progress
		if (isFetching) {
			return;
		}

		isFetching = true;
		set({ isLoading: true });
		const currentToken = useAuthStore.getState().token;

		try {
			const params = {
				...(options?.page && { page: options.page }),
				...(options?.page_size && { page_size: options.page_size }),
				...(options?.search && { search: options.search }),
				...(options?.status &&
					options.status !== 'all' && { status: options.status }),
				...(options?.category &&
					options.category !== 'all' && { category: options.category }),
			};

			const response = await api.get('/bookings', {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
				params,
			});

			const responseData = response.data as BookingsResponse;

			if (responseData && responseData.data) {
				set({
					bookings: responseData.data,
					pagination: {
						page: responseData.pagination.page,
						pageSize: responseData.pagination.pageSize,
						totalItems: responseData.pagination.totalItems,
						totalPages: responseData.pagination.totalPages,
					},
					isLoading: false,
				});
				isFetching = false;
				return;
			} else {
				toast.error('Invalid response format from server');
			}
		} catch (error) {
			const typedError = error as AxiosError<{ message?: string }>;

			const msg =
				typedError.response?.data?.message || 'Failed to fetch bookings';
			toast.error(msg);
		}

		// fallback state
		set({
			bookings: [],
			pagination: { totalItems: 0, totalPages: 0, page: 1, pageSize: 10 },
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
			// Get the current booking to provide required fields if needed
			let currentBooking =
				get().bookings.find((booking) => booking.id === id) ||
				get().selectedBooking;

			console.log('updateBooking - Input data:', data);
			console.log('updateBooking - Current booking found:', currentBooking);

			if (!currentBooking) {
				console.log('updateBooking - No booking found, fetching from API...');
				// Try to fetch the booking from API if not in store
				const apiBooking = await makeAuthenticatedRequest<BookingResponse>(
					'get',
					`/bookings/${id}`,
				);

				if (!apiBooking?.data) {
					toast.error('Booking not found');
					return null;
				}

				// Update the booking in store and use it
				set({ selectedBooking: apiBooking.data });
				currentBooking = apiBooking.data;
			}

			// Helper function to format date to YYYY-MM-DD
			const formatDate = (dateString: string) => {
				return dateString.split('T')[0];
			};

			// Create update data - API requires these fields, so provide current values if not being updated
			const updateData: UpdateBookingRequest = {
				...data,
				// Always include required fields with current values if not being updated
				start_date: data.start_date || formatDate(currentBooking.start_date),
				end_date: data.end_date || formatDate(currentBooking.end_date),
				total_amount: data.total_amount || currentBooking.total_amount,
			};

			console.log('updateBooking - Final payload:', updateData);

			const response = await makeAuthenticatedRequest<BookingResponse>(
				'put',
				`/bookings/${id}`,
				updateData,
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

		// Cancel a booking by updating its status
		cancelBooking: async (id: string, status: string) => {
			const requestData: UpdateBookingStatusRequest = {
				status,
			};

			const response = await makeAuthenticatedRequest<BookingResponse>(
				'post',
				`/bookings/${id}/status`,
				requestData,
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

				toast.success(`Booking status updated to ${status} successfully`);
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
