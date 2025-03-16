/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '../auth/useAuth';
import { RevenueBreakdownState } from '@/types/revenue';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

// Create and export the Zustand store
export const useRevenueBreakdownStore = create<RevenueBreakdownState>((set) => {
	// Define the fetch function outside the store methods
	const fetchBreakdownData = async () => {
		// If we're already fetching, don't start another request
		if (isFetching) {
			console.log('Skipping duplicate revenue-breakdown API call');
			return;
		}

		isFetching = true;
		set({ isLoading: true, error: null });
		const currentToken = useAuthStore.getState().token;

		try {
			console.log('Fetching revenue-breakdown data');
			const response = await api.get('/admin/revenue-breakdown', {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});

			// Store the response data
			const responseData = response.data;

			// Check if the response is valid
			if (responseData && responseData.data) {
				set({
					breakdownData: responseData.data,
					isLoading: false,
				});
			} else if (responseData === null || responseData.data === null) {
				// Handle null data scenario
				console.log('API returned null data for revenue breakdown');
				set({
					breakdownData: null,
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
			console.error('Error fetching revenue breakdown data:', error);
			const errorMessage =
				(error as any).response?.data?.message ||
				'Failed to fetch revenue breakdown';
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
		breakdownData: null,
		isLoading: false,
		error: null,

		// Get revenue breakdown data from API with duplicate request prevention
		getRevenueBreakdown: async () => {
			return fetchBreakdownData();
		},

		// Reset breakdown data state
		resetBreakdownData: () => {
			set({
				breakdownData: null,
				error: null,
			});
		},
	};
});

// Helper hook to format and process the breakdown data for charts
export const useBreakdownChartData = () => {
	const { breakdownData } = useRevenueBreakdownStore();

	// Format category data for chart
	const categoryChartData =
		breakdownData?.by_category?.map((item) => ({
			name: item.category,
			value: item.revenue,
			fill: getCategoryColor(item.category),
		})) || [];

	// Format period data for chart (may be used for other visualizations)
	const periodChartData =
		breakdownData?.by_period?.map((item) => ({
			name: item.period,
			value: item.revenue,
		})) || [];

	// Calculate total revenue from category data
	const totalRevenue = categoryChartData.reduce(
		(sum, item) => sum + item.value,
		0,
	);

	return {
		categoryChartData,
		periodChartData,
		totalRevenue,
	};
};

// Helper function to assign colors to categories
function getCategoryColor(category: string): string {
	// Define a color map for common categories
	const colorMap: Record<string, string> = {
		Food: 'var(--color-food, hsl(var(--chart-1)))',
		Beverage: 'var(--color-beverage, hsl(var(--chart-2)))',
		Accommodation: 'var(--color-accommodation, hsl(var(--chart-3)))',
		Service: 'var(--color-service, hsl(var(--chart-4)))',
		Event: 'var(--color-event, hsl(var(--chart-5)))',
	};

	// Return the mapped color or a default color
	return (
		colorMap[category] || 'var(--color-other, hsl(var(--chart-6, 217 91% 60%)))'
	);
}
