/* eslint-disable @typescript-eslint/no-explicit-any */

// Active Tents Metrics
export type ActiveTentsMetrics = {
	active_tents: number;
	total_tents: number;
	period: string;
};

// Growth Rate Metrics
export type GrowthRateMetrics = {
	percentage: number;
	change: number;
	period: string;
};

// Total Bookings Metrics
export type TotalBookingsMetrics = {
	total: number;
	change: number;
	period: string;
};

// Total Revenue Metrics
export type TotalRevenueMetrics = {
	amount: number;
	change: number;
	period: string;
};

// Combined Overview Metrics
export type OverviewMetrics = {
	active_tents: ActiveTentsMetrics;
	growth_rate: GrowthRateMetrics;
	total_bookings: TotalBookingsMetrics;
	total_revenue: TotalRevenueMetrics;
};

// Overview State Type Definition
export type OverviewState = {
	// State
	metrics: OverviewMetrics | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	getOverviewMetrics: () => Promise<void>;
	resetOverviewMetrics: () => void;
};
