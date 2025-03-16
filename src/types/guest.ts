/* eslint-disable @typescript-eslint/no-explicit-any */

// Daily Guest Count Data Structure
export type GuestDailyData = {
	date: string;
	vip: number;
	standard: number;
};

// Total Guest State Type
export type TotalGuestState = {
	// State
	guestData: GuestDailyData[];
	isLoading: boolean;
	error: string | null;

	// Actions
	getTotalGuestData: () => Promise<void>;
	resetGuestData: () => void;
};
