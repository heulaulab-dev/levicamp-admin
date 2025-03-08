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
};

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface RefundDetailsProps {
	refund: Refund;
	onOpenChange?: (open: boolean) => void;
}

export interface UpdateStatusProps {
	refund: Refund;
	onOpenChange: (open: boolean) => void;
}
