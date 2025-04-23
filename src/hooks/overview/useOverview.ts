/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { OverviewStoreState, initialMetrics } from '@/types/overview';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

// Default initial metrics values

export const useOverviewStore = create<OverviewStoreState>((set) => {
	// Define the fetch function outside the store methods
	const fetchOverviewMetrics = async () => {
		// If we're already fetching, don't start another request
		if (isFetching) {
			// console.log('Skipping duplicate overview API call');
			return;
		}

		isFetching = true;
		set({ isLoading: true, error: null });
		const currentToken = useAuthStore.getState().token;

		try {
			// console.log('Fetching overview metrics data');
			const response = await api.get('/admin/overview', {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});

			const metricsData = response?.data?.data;

			if (metricsData) {
				// Store complete metrics
				set({ metrics: metricsData });

				// Store individual metrics in their own slices
				set({
					activeTents: metricsData.active_tents,
					growthRate: metricsData.growth_rate,
					totalBookings: metricsData.total_bookings,
					totalRevenue: metricsData.total_revenue,
				});
			} else {
				// console.error('Unexpected API response format:', data);
				set({ error: 'Invalid response format from server' });
			}
		} catch (error) {
			// console.error('Error fetching overview metrics:', error);
			const errorResponse = (error as any)?.response?.data;
			const errorMessage =
				errorResponse?.error?.description || 'Failed to fetch overview metrics';
			set({ error: errorMessage });
		} finally {
			set({ isLoading: false });
			isFetching = false;
		}
	};

	return {
		// Base State
		metrics: null,
		isLoading: false,
		error: null,

		// Metrics Slices - Initial Values
		activeTents: initialMetrics.active_tents,
		growthRate: initialMetrics.growth_rate,
		totalBookings: initialMetrics.total_bookings,
		totalRevenue: initialMetrics.total_revenue,

		// Metrics Slice Setters
		setActiveTents: (data) => set({ activeTents: data }),
		setGrowthRate: (data) => set({ growthRate: data }),
		setTotalBookings: (data) => set({ totalBookings: data }),
		setTotalRevenue: (data) => set({ totalRevenue: data }),

		// API Actions
		getOverviewMetrics: async () => {
			return fetchOverviewMetrics();
		},

		resetOverviewMetrics: () => {
			set({
				metrics: null,
				activeTents: initialMetrics.active_tents,
				growthRate: initialMetrics.growth_rate,
				totalBookings: initialMetrics.total_bookings,
				totalRevenue: initialMetrics.total_revenue,
				error: null,
			});
		},
	};
});