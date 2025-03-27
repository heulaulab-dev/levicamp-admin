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

export const initialMetrics: OverviewMetrics = {
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
export type ActiveTentsSlice = {
	activeTents: ActiveTentsMetrics;
	setActiveTents: (data: ActiveTentsMetrics) => void;
};

// Growth Rate Slice
export type GrowthRateSlice = {
	growthRate: GrowthRateMetrics;
	setGrowthRate: (data: GrowthRateMetrics) => void;
};

// Total Bookings Slice
export type TotalBookingsSlice = {
	totalBookings: TotalBookingsMetrics;
	setTotalBookings: (data: TotalBookingsMetrics) => void;
};

// Total Revenue Slice
export type TotalRevenueSlice = {
	totalRevenue: TotalRevenueMetrics;
	setTotalRevenue: (data: TotalRevenueMetrics) => void;
};

// Combined State Type
export type OverviewStoreState = OverviewState &
	ActiveTentsSlice &
	GrowthRateSlice &
	TotalBookingsSlice &
	TotalRevenueSlice;
