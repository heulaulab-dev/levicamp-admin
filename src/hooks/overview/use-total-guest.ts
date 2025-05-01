/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { GuestDailyData, TotalGuestState } from '@/types/guest';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

// Create and export the Zustand store
export const useTotalGuestStore = create<TotalGuestState>((set) => {
	// Define the fetch function outside the store methods
	const fetchGuestData = async () => {
		// If we're already fetching, don't start another request
		if (isFetching) {
			return;
		}

		isFetching = true;
		set({ isLoading: true, error: null });
		const { token } = useAuthStore.getState();

		try {
			const response = await api.get('/admin/total-guest', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Store the entire response data
			const responseData = response.data;
			console.log('Total guest data response:', responseData);

			// Check if the response is valid and has data
			if (responseData?.status === 200 && Array.isArray(responseData.data)) {
				// Transform the data to our internal format
				const transformedData = responseData.data.map((item: any) => ({
					date: item.date,
					vip: item.VIP || 0,
					standard: item.Standard || 0,
				}));

				set({
					guestData: transformedData,
					isLoading: false,
				});
			} else if (responseData?.data === null) {
				// Handle null data scenario - set empty array but don't trigger error
				set({
					guestData: [],
					isLoading: false,
				});
			} else {
				console.error('Unexpected API response format:', responseData);
				set({
					error: 'Invalid response format from server',
					isLoading: false,
				});
			}
		} catch (error) {
			console.error('Error fetching total guest data:', error);
			const errorResponse = (error as any).response;
			const errorMessage =
				errorResponse?.data?.message || 'Failed to fetch guest data';

			// Handle 429 error specifically
			if (errorResponse?.status === 429) {
			} else {
				toast.error(errorMessage);
			}

			set({
				error: errorMessage,
				isLoading: false,
			});
		} finally {
			isFetching = false;
			set({ isLoading: false });
		}
	};

	return {
		// State
		guestData: [],
		isLoading: false,
		error: null,

		// Get total guest data from API with duplicate request prevention
		getTotalGuestData: async () => {
			return fetchGuestData();
		},

		// Reset guest data state
		resetGuestData: () => {
			set({
				guestData: [],
				error: null,
			});
		},
	};
});

// Helper functions to extract and format data for charts
export const useGuestChartData = () => {
	const { guestData } = useTotalGuestStore();

	// Safety check - ensure guestData is an array (defensive programming)
	const safeGuestData = Array.isArray(guestData) ? guestData : [];

	// Format dates for display
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	};

	// Extract dates for chart labels
	const dates = safeGuestData.map((item) => formatDate(item.date));

	// Extract VIP guest counts
	const vipData = safeGuestData.map((item) => item.vip);

	// Extract standard guest counts
	const standardData = safeGuestData.map((item) => item.standard);

	// Calculate total guests per day
	const totalData = safeGuestData.map((item) => item.vip + item.standard);

	// Calculate sum totals - with fallbacks for empty arrays
	const totalVipGuests = vipData.length
		? vipData.reduce((sum, count) => sum + count, 0)
		: 0;
	const totalStandardGuests = standardData.length
		? standardData.reduce((sum, count) => sum + count, 0)
		: 0;
	const totalGuests = totalVipGuests + totalStandardGuests;

	return {
		dates,
		vipData,
		standardData,
		totalData,
		totalVipGuests,
		totalStandardGuests,
		totalGuests,
	};
};
