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

export interface Payment {
	id: string;
	booking_id: string;
	booking?: Booking;
	transaction_id: string;
	transaction_status: string;
	payment_method: string;
	total_amount: number;
	expired_at: string;
	created_at: string;
	updated_at: string;
}

export interface PaymentDetail {
	type: string;
	name: string;
	method: string;
	url: string;
}

export interface PaymentResponse {
	status: number;
	message: string;
	data: {
		order_id: string;
		payment: Payment;
		payment_detail: PaymentDetail[];
		expired_at: string;
	};
}

export interface PaymentStatusResponse {
	status: number;
	message: string;
	data: Payment;
}

export interface PaymentRequest {
	payment_method: string;
}

export interface PaymentStore {
	loading: boolean;
	error: string | null;
	paymentData: PaymentResponse | null;
	paymentStatus: Payment | null;
	isPolling: boolean;
	pollingInterval: NodeJS.Timeout | null;
	createPayment: (
		bookingId: string,
		data: PaymentRequest,
	) => Promise<PaymentResponse>;
	checkPaymentStatus: (bookingId: string) => Promise<Payment>;
	startPolling: (bookingId: string, options?: PollingOptions) => () => void;
	stopPolling: () => void;
	resetPayment: () => void;
}

export interface PollingOptions {
	interval?: number; // polling interval in milliseconds
	maxAttempts?: number; // maximum number of polling attempts
	onSuccess?: (payment: Payment) => void;
	onError?: (error: Error) => void;
	onExpired?: (payment: Payment) => void;
}

export interface PaymentDetails {
	order_id: string;
	payment: Payment & {
		payment_reference?: string;
	};
	payment_detail: Array<{
		type: string;
		name: string;
		method: string;
		url: string;
	}>;
	expired_at: string;
}

export interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	paymentDetails: PaymentDetails | null;
	paymentMethod: string;
}
