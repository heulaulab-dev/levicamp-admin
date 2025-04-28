/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
// import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { RevenueBreakdownState } from '@/types/revenue';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

// Create and export the Zustand store
export const useRevenueBreakdownStore = create<RevenueBreakdownState>((set) => {
	// Define the fetch function outside the store methods
	const fetchBreakdownData = async () => {
		// If we're already fetching, don't start another request
		if (isFetching) {
			return;
		}

		isFetching = true;
		set({ isLoading: true, error: null });
		const { token } = useAuthStore.getState();

		try {
			const response = await api.get('/admin/revenue-breakdown', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const responseData = response.data;

			if (responseData?.status === 200 && Array.isArray(responseData.data)) {
				set({ breakdownData: responseData.data, isLoading: false });
			} else {
				throw new Error('Invalid response format');
			}
		} catch (error) {
			const errorResponse = (error as any).response?.data;
			const errorMessage =
				errorResponse?.error?.description ||
				'Failed to fetch revenue breakdown';
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

	// Format data for chart
	const categoryChartData =
		breakdownData?.map((item: any) => ({
			name: item.category,
			value: item.percentage,
			fill: getCategoryColor(item.category),
		})) || [];

	// Calculate total percentage
	const totalRevenue = categoryChartData.reduce(
		(sum: number, item: { value: number }) => sum + item.value,
		0,
	);

	return {
		categoryChartData,
		totalRevenue,
	};
};

// Helper function to assign colors to categories
function getCategoryColor(category: string): string {
	const colorMap: Record<string, string> = {
		'VIP': 'var(--chart-1)',
		'Standard': 'var(--chart-2)',
		'Additional Services': 'var(--chart-3)',
	};

	return colorMap[category] || 'var(--chart-6)';
}
