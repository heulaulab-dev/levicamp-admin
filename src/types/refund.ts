export type Refund = {
	id: string;
	guestName: string;
	amount: number;
	date: string;
	bookingId: string;
	reason: string;
	status: RefundStatus;
	refundedDate?: string;
	paymentProof?: string;
	rejectReason?: string;
	notes?: string;
	refundMethod?: string;
	accountName?: string;
	accountNumber?: string;
	completedBy?: string;
	booking?: BookingDetails;
	responses?: RefundResponse | RefundResponse[];
};

export type RefundStatus = 'pending' | 'processing' | 'success' | 'rejected';

export interface RefundDetailsProps {
	refund: Refund;
	onOpenChange?: (open: boolean) => void;
}

export interface UpdateStatusProps {
	refund: Refund;
	onOpenChange: (open: boolean) => void;
}

export interface RefundApiResponse<T> {
	status: number;
	message: string;
	data: T;
	pagination?: PaginationInfo;
}

export interface PaginationInfo {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

export interface GuestDetails {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	created_at: string;
	updated_at: string;
}

export interface ReservationDetails {
	id: string;
	start_date: string;
	end_date: string;
	price: number;
	tent_id: string;
	tent: null | Record<string, unknown>;
	guest_id: string;
	check_in: string | null;
	check_out: string | null;
	status: string;
	created_at: string;
	updated_at: string;
}

export interface DetailBookingItem {
	id: string;
	booking_id: string;
	reservation_id: string;
	reservation: ReservationDetails;
	created_at: string;
	updated_at: string;
}

export interface BookingDetails {
	id: string;
	guest_id: string;
	guest?: GuestDetails;
	total_amount: number;
	start_date: string;
	end_date: string;
	status: string;
	detail_booking: null | DetailBookingItem[];
	created_at: string;
	updated_at: string;
}

export interface RefundResponse {
	id: string;
	refund_request_id: string;
	admin_id: string;
	refund_amount: number;
	status: string;
	additional_info: string;
	payment_proof: string;
	processed_at: string;
	created_at: string;
	updated_at: string;
	action?: string;
}

export interface RefundListItem {
	id: string;
	booking_id: string;
	booking: BookingDetails;
	refund_amount: number;
	refund_method: string;
	account_name: string;
	account_number: string;
	status: RefundStatus;
	reason: string;
	token: string;
	used: boolean;
	request_count: number;
	completed_by: string;
	completed_at: string;
	expired_at: string;
	created_at: string;
	updated_at: string;
	responses?: RefundResponse | RefundResponse[];
	reject_reason?: string;
	payment_proof?: string;
}

export interface RefundDetailItem extends RefundListItem {
	responses: RefundResponse | RefundResponse[];
}

// Helper functions to access nested properties consistently, accepting any refund type
export const getRefundPaymentProof = (refund: {
	responses?: RefundResponse | RefundResponse[];
	paymentProof?: string;
}): string | undefined => {
	if (!refund.responses) return refund.paymentProof;

	// If responses is an array, get the first item's payment proof
	if (Array.isArray(refund.responses) && refund.responses.length > 0) {
		return refund.responses[0].payment_proof;
	}

	// If responses is a single object
	return (refund.responses as RefundResponse).payment_proof;
};

export const getRefundRejectReason = (refund: {
	responses?: RefundResponse | RefundResponse[];
	rejectReason?: string;
}): string | undefined => {
	if (!refund.responses) return refund.rejectReason;

	// If responses is an array, look for rejection info
	if (Array.isArray(refund.responses)) {
		const rejectionResponse = refund.responses.find(
			(r) => r.status === 'rejected',
		);
		return rejectionResponse?.additional_info;
	}

	// If responses is a single object and status is rejected
	const response = refund.responses as RefundResponse;
	return response.status === 'rejected' ? response.additional_info : undefined;
};

export interface ValidateRefundResponse {
	booking_id: string;
	status: string;
}

export interface SubmitRefundRequest {
	token: string;
	reason: string;
	refund_method: string;
	account_name: string;
	account_number: string;
}

export interface ApproveRefundRequest {
	additional_info?: string;
	payment_proof: string;
	refund_amount: number;
}

export interface RejectRefundRequest {
	additional_info: string;
}

export interface RefundQueryParams {
	order?: 'asc' | 'desc';
	page?: number;
	page_size?: number;
	payment?: string;
	sort?: string;
	status?: RefundStatus;
}

export interface AdminDetails {
	id: string;
	name: string;
	username: string;
	password: string;
	phone: string;
	email: string;
	updated_at: string;
	created_at: string;
}

export interface RefundRequestDetail {
	id: string;
	booking_id: string;
	refund_amount: number;
	refund_method: string;
	account_name: string;
	account_number: string;
	status: RefundStatus;
	reason: string;
	token: string;
	used: boolean;
	request_count: number;
	completed_by: string;
	completed_at: string;
	expired_at: string;
	created_at: string;
	updated_at: string;
}

export interface RefundResponseDetail {
	id: string;
	refund_request_id: string;
	refund_request: RefundRequestDetail;
	admin_id: string;
	admin: AdminDetails;
	refund_amount: number;
	status: string;
	additional_info: string;
	payment_proof: string;
	processed_at: string;
	created_at: string;
	updated_at: string;
}

export interface RefundCountResponse {
	count: number;
}

export interface RefundState {
	refunds: Refund[];
	selectedRefund: RefundDetailItem | null;
	isLoading: boolean;
	error: string | null;
	pagination: PaginationInfo | null;
	pendingCount: number;

	getRefunds: (params?: RefundQueryParams) => Promise<void>;
	getRefundById: (id: string) => Promise<RefundDetailItem>;
	pendingNotificationRefund: () => Promise<number>;
	approveRefund: (
		id: string,
		data: ApproveRefundRequest,
	) => Promise<RefundResponseDetail>;
	rejectRefund: (
		id: string,
		data: RejectRefundRequest,
	) => Promise<RefundResponseDetail>;
	completeRefund: (id: string) => Promise<RefundResponseDetail>;
}
