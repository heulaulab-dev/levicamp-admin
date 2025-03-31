// Daily Guest Count Data Structure
export type GuestDailyData = {
	date: string;
} & Record<string, number>;

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
