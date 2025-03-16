// Guest type
export type Guest = {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	created_at: string;
	updated_at: string;
};

// Tent Category type
export type TentCategory = {
	id: string;
	name: string;
	weekday_price: number;
	weekend_price: number;
	facilities: {
		[key: string]: string;
	};
	description: string;
	created_at: string;
	updated_at: string;
};

// Tent type
export type Tent = {
	id: string;
	name: string;
	tent_image: string;
	description: string;
	facilities: string[];
	category_id: string;
	category: TentCategory;
	status: string;
	weekday_price: number;
	weekend_price: number;
	created_at: string;
	updated_at: string;
};

// Reservation type
export type Reservation = {
	id: string;
	start_date: string;
	end_date: string;
	price: number;
	tent_id: string;
	tent: Tent;
	guest_id: string;
	check_in: string | null;
	check_out: string | null;
	status: string;
	created_at: string;
	updated_at: string;
};

// Detail Booking type
export type DetailBooking = {
	id: string;
	booking_id: string;
	reservation_id: string;
	reservation: Reservation;
	created_at: string;
	updated_at: string;
};

// Booking type
export type Booking = {
	id: string;
	guest_id: string;
	guest: Guest;
	total_amount: number;
	start_date: string;
	end_date: string;
	status: string;
	detail_booking: DetailBooking[];
	created_at: string;
	updated_at: string;
};

// Pagination type
export type Pagination = {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

// API Response type
export type BookingsResponse = {
	status: number;
	message: string;
	data: Booking[];
	pagination: Pagination;
};

// AddOn type
export type AddOn = {
	id: string;
	name: string;
	price: number;
	quantity: number;
};

// Booking Store State type
export type BookingState = {
	bookings: Booking[];
	isLoading: boolean;
	pagination: {
		total: number;
		page: number;
		pageSize: number;
	} | null;
	selectedBooking: Booking | null;
	getBookings: (page?: number, pageSize?: number) => Promise<void>;
	getBookingById: (id: string) => Promise<Booking | null>;
	updateBooking: (
		id: string,
		data: Partial<Booking>,
	) => Promise<Booking | null>;
	updateBookingAddOns: (id: string, addOns: AddOn[]) => Promise<Booking | null>;
	checkInBooking: (id: string) => Promise<Booking | null>;
	checkOutBooking: (id: string) => Promise<Booking | null>;
	resetBookings: () => void;
};
