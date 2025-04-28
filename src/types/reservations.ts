import { DateRange } from 'react-day-picker';

export type Tent = {
	id: string;
	name: string;
	tent_images: string[];
	weekend_price?: number;
	weekday_price?: number;
	description: string;
	facilities: string[];
	category_id: string;
	category?: Category;
	status: 'available' | 'unavailable';
	updated_at?: string;
	created_at?: string;
	capacity: number;
	price: number;
};

export type Category = {
	id: string;
	name: string;
	price: number;
	description: string;
	tents: Tent[];
};

export type Reservation = {
	data: Category[];
	id: string;
	name: string;
	start_date: string;
	end_date: string;
	price: number;
	tent_id: string;
	guest_id: string;
	check_in?: string;
	check_out?: string;
	status:
		| 'pending'
		| 'confirmed'
		| 'checked-in'
		| 'completed'
		| 'canceled'
		| 'refund'
		| 'rescheduled';
};

export type responseArray = {
	message: string;
	status: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any[];
};

export type responseObject = {
	message: string;
	status: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
};

export interface ReservationRequest {
	name: string;
	email: string;
	phone: string;
	address: string;
	tent_id: string[];
	start_date: string;
	end_date: string;
}

export interface DetailBooking {
	price: number;
	tent_id: string;
}

export interface Booking {
	id: string;
	guest_id: string;
	total_amount: number;
	start_date: string;
	end_date: string;
	status: string;
	detail_booking: null;
	created_at: string;
	updated_at: string;
}

export interface Guest {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	created_at: string;
	updated_at: string;
}

export interface ReservationResponse {
	status: number;
	message: string;
	data: {
		booking: Booking;
		guest: Guest;
		reservations: DetailBooking[];
		total_booking_price: number;
	};
}

export interface ReservationStore {
	date: DateRange | undefined;
	reservationData: Category[] | null;
	loading: boolean;
	error: string | null;
	showResults: boolean;
	selectedCategory: string;
	setDate: (date: DateRange | undefined) => void;
	setSelectedCategory: (category: string) => void;
	handleSearch: (onError: (message: string) => void) => Promise<void>;
	createReservation: (data: ReservationRequest) => Promise<ReservationResponse>;
	checkPrice: (
		tentIds: string[],
		startDate: Date,
		endDate: Date,
	) => Promise<PriceCheckResponse | null>;
}

export interface PriceCheckResponse {
	status: number;
	message: string;
	data: {
		total_price: number;
		tents: Array<{
			id: string;
			category: string;
			capacities: string;
			price: number;
		}>;
		start_date: string;
		end_date: string;
	};
}
