/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '../auth/useAuth';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { GuestDailyData, TotalGuestState } from '@/types/guest';
/* eslint-enable @typescript-eslint/no-unused-vars */

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

// Create and export the Zustand store
export const useTotalGuestStore = create<TotalGuestState>((set) => {
	// Define the fetch function outside the store methods
	const fetchGuestData = async () => {
		// If we're already fetching, don't start another request
		if (isFetching) {
			console.log(
				'Skipping duplicate total-guest API call - request in progress',
			);
			return;
		}

		isFetching = true;
		set({ isLoading: true, error: null });
		const currentToken = useAuthStore.getState().token;

		try {
			console.log('Fetching total-guest data');
			const response = await api.get('/admin/total-guest', {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});

			// Store the entire response data which might contain data: null
			const responseData = response.data;

			// Check if the response is valid
			if (Array.isArray(responseData)) {
				set({
					guestData: responseData,
					isLoading: false,
				});
			} else if (
				responseData === null ||
				(responseData && responseData.data === null)
			) {
				// Handle null data scenario - set empty array but don't trigger error
				console.log('API returned null data for guest metrics');
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
			const errorMessage =
				(error as any).response?.data?.message || 'Failed to fetch guest data';

			// Handle 429 error specifically
			if ((error as any).response?.status === 429) {
				console.log('Rate limit exceeded for total-guest endpoint');
				toast.error('Too many requests. Please try again later.');
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
