/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { RevenuePeriod, RevenueOverviewState } from '@/types/revenue';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

export const useRevenueOverviewStore = create<RevenueOverviewState>((set, get) => {
	const fetchRevenueData = async (period?: RevenuePeriod) => {
		if (isFetching) return;

		isFetching = true;
		const activePeriod = period || get().period;
		set({ isLoading: true, error: null });

		const { token } = useAuthStore.getState();

		try {
			const response = await api.get('/admin/revenue-overview', {
				params: { period: activePeriod },
				headers: { Authorization: `Bearer ${token}` },
			});

			const revenueData = response.data?.data;
			if (!Array.isArray(revenueData))
				throw new Error('Invalid response format');

			set({ revenueData, isLoading: false });
		} catch (error) {
			const errorMessage =
				(error as any)?.response?.data?.error?.description ||
				'Failed to fetch revenue data';
			toast.error(errorMessage);
			set({ error: errorMessage, isLoading: false });
		} finally {
			isFetching = false;
		}
	};

	return {
		revenueData: [],
		period: 'monthly',
		isLoading: false,
		error: null,

		setPeriod: (period: RevenuePeriod) => {
			set({ period });
			setTimeout(() => fetchRevenueData(period), 10);
		},

		getRevenueOverview: async (period?: RevenuePeriod) => {
			return fetchRevenueData(period);
		},

		resetRevenueData: () => {
			set({ revenueData: [], error: null });
		},
	};
});

// Helper function to format and process revenue data for charts
export const useRevenueChartData = () => {
	const { revenueData, period } = useRevenueOverviewStore();
	const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];

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

	const chartData = safeRevenueData.map((item) => ({
		date: formatDate(item.date),
		amount: item.revenue,
		rawDate: item.date,
	}));

	chartData.sort(
		(a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime(),
	);

	const totalRevenue = safeRevenueData.reduce(
		(sum, item) => sum + item.revenue,
		0,
	);
	const highestRevenue = Math.max(
		...safeRevenueData.map((item) => item.revenue),
		0,
	);

	const dates = chartData.map((item) => item.date);
	const amounts = chartData.map((item) => item.amount);

	return { chartData, dates, amounts, totalRevenue, highestRevenue, period };
};
