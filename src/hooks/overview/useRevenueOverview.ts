/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '../auth/useAuth';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	RevenuePeriod,
	RevenueDataPoint,
	RevenueOverviewState,
} from '@/types/revenue';
/* eslint-enable @typescript-eslint/no-unused-vars */

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

// Create and export the Zustand store
export const useRevenueOverviewStore = create<RevenueOverviewState>(
	(set, get) => {
		// Define the fetch function outside the store to avoid recreation
		const fetchRevenueData = async (period?: RevenuePeriod) => {
			// If we're already fetching, don't start another request
			if (isFetching) {
				console.log('Skipping duplicate revenue-overview API call');
				return;
			}

			isFetching = true;
			const activePeriod = period || get().period;
			set({ isLoading: true, error: null });

			const currentToken = useAuthStore.getState().token;

			try {
				console.log(
					`Fetching revenue-overview data for period: ${activePeriod}`,
				);
				const response = await api.get('/admin/revenue-overview', {
					params: { period: activePeriod },
					headers: {
						Authorization: `Bearer ${currentToken}`,
					},
				});

				// Store the entire response data
				const responseData = response.data;

				// Check if the response is valid
				if (Array.isArray(responseData)) {
					set({
						revenueData: responseData,
						isLoading: false,
					});
				} else if (responseData && Array.isArray(responseData.data)) {
					// Handle nested data structure
					set({
						revenueData: responseData.data,
						isLoading: false,
					});
				} else if (
					responseData === null ||
					(responseData && responseData.data === null)
				) {
					// Handle null data scenario
					console.log('API returned null data for revenue overview');
					set({
						revenueData: [],
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
				console.error('Error fetching revenue overview data:', error);
				const errorMessage =
					(error as any).response?.data?.message ||
					'Failed to fetch revenue data';
				toast.error(errorMessage);
				set({
					error: errorMessage,
					isLoading: false,
				});
			} finally {
				isFetching = false;
			}
		};

		return {
			// State
			revenueData: [],
			period: 'monthly', // Default to monthly view
			isLoading: false,
			error: null,

			// Set the period and fetch new data
			setPeriod: (period: RevenuePeriod) => {
				set({ period });
				// Call the API with the new period
				setTimeout(() => fetchRevenueData(period), 10);
			},

			// Get revenue overview data from API with duplicate request prevention
			getRevenueOverview: async (period?: RevenuePeriod) => {
				return fetchRevenueData(period);
			},

			// Reset revenue data state
			resetRevenueData: () => {
				set({
					revenueData: [],
					error: null,
				});
			},
		};
	},
);

// Helper function to format and process revenue data for charts
export const useRevenueChartData = () => {
	const { revenueData, period } = useRevenueOverviewStore();

	// Safety check - ensure revenueData is an array
	const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];

	// Format dates based on the selected period
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);

		switch (period) {
			case 'daily':
				return date.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
				});
			case 'monthly':
				return date.toLocaleDateString('en-US', {
					month: 'short',
					year: 'numeric',
				});
			case 'yearly':
				return date.getFullYear().toString();
			default:
				return dateString;
		}
	};

	// Format the data for chart display
	const chartData = safeRevenueData.map((item) => ({
		date: formatDate(item.date),
		amount: item.amount,
		rawDate: item.date, // Keep original date for sorting
	}));

	// Sort the data by date
	chartData.sort(
		(a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime(),
	);

	// Calculate total revenue
	const totalRevenue = safeRevenueData.reduce(
		(sum, item) => sum + item.amount,
		0,
	);

	// Find highest revenue point
	const highestRevenue = Math.max(
		...safeRevenueData.map((item) => item.amount),
		0,
	);

	// Extract formatted dates and amounts for chart display
	const dates = chartData.map((item) => item.date);
	const amounts = chartData.map((item) => item.amount);

	return {
		chartData,
		dates,
		amounts,
		totalRevenue,
		highestRevenue,
		period,
	};
};
