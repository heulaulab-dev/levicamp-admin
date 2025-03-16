/* eslint-disable @typescript-eslint/no-explicit-any */

// Revenue period type
export type RevenuePeriod = 'daily' | 'monthly' | 'yearly';

// Single revenue data point
export type RevenueDataPoint = {
	date: string;
	amount: number;
};

// Revenue Overview State Type
export type RevenueOverviewState = {
	// State
	revenueData: RevenueDataPoint[];
	period: RevenuePeriod;
	isLoading: boolean;
	error: string | null;

	// Actions
	getRevenueOverview: (period?: RevenuePeriod) => Promise<void>;
	setPeriod: (period: RevenuePeriod) => void;
	resetRevenueData: () => void;
};

// Revenue Breakdown Category Item
export type RevenueCategoryItem = {
	category: string;
	revenue: number;
};

// Revenue Breakdown Period Item
export type RevenuePeriodItem = {
	period: string;
	revenue: number;
};

// Revenue Breakdown API Response
export type RevenueBreakdownResponse = {
	by_category: RevenueCategoryItem[];
	by_period: RevenuePeriodItem[];
};

// Revenue Breakdown State Type
export type RevenueBreakdownState = {
	// State
	breakdownData: RevenueBreakdownResponse | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	getRevenueBreakdown: () => Promise<void>;
	resetBreakdownData: () => void;
};
