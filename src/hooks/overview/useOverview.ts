/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '../auth/useAuth';
import {
	OverviewMetrics,
	OverviewState,
	ActiveTentsMetrics,
	GrowthRateMetrics,
	TotalBookingsMetrics,
	TotalRevenueMetrics,
} from '@/types/overview';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

// Default initial metrics values
const initialMetrics: OverviewMetrics = {
	active_tents: {
		active_tents: 0,
		total_tents: 0,
		period: 'last_month',
	},
	growth_rate: {
		percentage: 0,
		change: 0,
		period: 'last_month',
	},
	total_bookings: {
		total: 0,
		change: 0,
		period: 'last_month',
	},
	total_revenue: {
		amount: 0,
		change: 0,
		period: 'last_month',
	},
};

// Active Tents Slice
type ActiveTentsSlice = {
	activeTents: ActiveTentsMetrics;
	setActiveTents: (data: ActiveTentsMetrics) => void;
};

// Growth Rate Slice
type GrowthRateSlice = {
	growthRate: GrowthRateMetrics;
	setGrowthRate: (data: GrowthRateMetrics) => void;
};

// Total Bookings Slice
type TotalBookingsSlice = {
	totalBookings: TotalBookingsMetrics;
	setTotalBookings: (data: TotalBookingsMetrics) => void;
};

// Total Revenue Slice
type TotalRevenueSlice = {
	totalRevenue: TotalRevenueMetrics;
	setTotalRevenue: (data: TotalRevenueMetrics) => void;
};

// Combined State Type
type OverviewStoreState = OverviewState &
	ActiveTentsSlice &
	GrowthRateSlice &
	TotalBookingsSlice &
	TotalRevenueSlice;

export const useOverviewStore = create<OverviewStoreState>((set) => {
	// Define the fetch function outside the store methods
	const fetchOverviewMetrics = async () => {
		// If we're already fetching, don't start another request
		if (isFetching) {
			console.log('Skipping duplicate overview API call');
			return;
		}

		isFetching = true;
		set({ isLoading: true, error: null });
		const currentToken = useAuthStore.getState().token;

		try {
			console.log('Fetching overview metrics data');
			const { data } = await api.get('/admin/overview', {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});

			if (data && data.data) {
				// Store complete metrics
				set({ metrics: data.data });

				// Store individual metrics in their own slices
				const metricsData = data.data;
				set({
					activeTents: metricsData.active_tents,
					growthRate: metricsData.growth_rate,
					totalBookings: metricsData.total_bookings,
					totalRevenue: metricsData.total_revenue,
				});
			} else {
				console.error('Unexpected API response format:', data);
				set({ error: 'Invalid response format from server' });
			}
		} catch (error) {
			console.error('Error fetching overview metrics:', error);
			const errorMessage =
				(error as any).response?.data?.message ||
				'Failed to fetch overview metrics';

			// Handle 429 error specifically
			if ((error as any).response?.status === 429) {
				console.log('Rate limit exceeded for overview metrics');
				toast.error('Too many requests. Please try again later.');
			} else {
				toast.error(errorMessage);
			}

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
