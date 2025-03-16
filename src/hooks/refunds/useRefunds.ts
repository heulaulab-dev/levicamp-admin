import { create } from 'zustand';
import { toast } from 'sonner';
import { Refund, RefundStatus } from '@/types/refund';

interface RefundApiResponse<T> {
	status: string;
	message: string;
	data: T;
}

interface RefundListItem {
	id: string;
	booking_id: string;
	reason: string;
	status: RefundStatus;
	refund_amount: number;
	created_at: string;
	updated_at: string;
}

interface ValidateRefundResponse {
	booking_id: string;
	status: string;
}

interface SubmitRefundRequest {
	token: string;
	reason: string;
	refund_method: string;
	account_name: string;
	account_number: string;
}

interface ApproveRefundRequest {
	additional_info?: string;
	payment_proof: string;
	refund_amount: number;
}

interface RejectRefundRequest {
	additional_info: string;
}

interface RefundState {
	refunds: Refund[];
	isLoading: boolean;
	error: string | null;

	// Actions
	fetchRefunds: () => Promise<void>;
	validateRefundRequest: (token: string) => Promise<ValidateRefundResponse>;
	submitRefundDetails: (data: SubmitRefundRequest) => Promise<void>;
	approveRefund: (id: string, data: ApproveRefundRequest) => Promise<void>;
	rejectRefund: (id: string, data: RejectRefundRequest) => Promise<void>;
	completeRefund: (id: string) => Promise<void>;
}

const makeAuthenticatedRequest = async <T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<RefundApiResponse<T>> => {
	const token = localStorage.getItem('token');
	if (!token) {
		throw new Error('No authentication token found');
	}

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_TEST_API_URL}${endpoint}`,
		{
			...options,
			headers: {
				...options.headers,
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		},
	);

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'An error occurred');
	}

	return data;
};

export const useRefunds = create<RefundState>((set, get) => ({
	refunds: [],
	isLoading: false,
	error: null,

	fetchRefunds: async () => {
		try {
			set({ isLoading: true, error: null });
			const response = await makeAuthenticatedRequest<RefundListItem[]>(
				'/refunds',
			);

			const formattedRefunds: Refund[] = response.data.map((refund) => ({
				id: refund.id,
				bookingId: refund.booking_id,
				amount: refund.refund_amount,
				reason: refund.reason,
				status: refund.status,
				date: refund.created_at,
				refundedDate: refund.updated_at,
				guestName: '', // This will be populated from the booking details if needed
			}));

			set({ refunds: formattedRefunds, isLoading: false });
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to fetch refunds';
			set({ error: errorMessage, isLoading: false });
			toast.error(errorMessage);
		}
	},

	validateRefundRequest: async (token: string) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/refunds/validate?token=${token}`,
			);
			const data =
				(await response.json()) as RefundApiResponse<ValidateRefundResponse>;

			if (!response.ok) {
				throw new Error(data.message || 'Invalid refund request');
			}

			return data.data;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to validate refund request';
			toast.error(errorMessage);
			throw error;
		}
	},

	submitRefundDetails: async (data: SubmitRefundRequest) => {
		try {
			await makeAuthenticatedRequest('/refunds', {
				method: 'POST',
				body: JSON.stringify(data),
			});

			toast.success('Refund details submitted successfully');
			get().fetchRefunds(); // Refresh the list
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to submit refund details';
			toast.error(errorMessage);
			throw error;
		}
	},

	approveRefund: async (id: string, data: ApproveRefundRequest) => {
		try {
			await makeAuthenticatedRequest(`/refunds/${id}/approve`, {
				method: 'POST',
				body: JSON.stringify(data),
			});

			toast.success('Refund approved successfully');
			get().fetchRefunds(); // Refresh the list
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to approve refund';
			toast.error(errorMessage);
			throw error;
		}
	},

	rejectRefund: async (id: string, data: RejectRefundRequest) => {
		try {
			await makeAuthenticatedRequest(`/refunds/${id}/reject`, {
				method: 'POST',
				body: JSON.stringify(data),
			});

			toast.success('Refund rejected successfully');
			get().fetchRefunds(); // Refresh the list
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to reject refund';
			toast.error(errorMessage);
			throw error;
		}
	},

	completeRefund: async (id: string) => {
		try {
			await makeAuthenticatedRequest(`/refunds/${id}/complete`, {
				method: 'POST',
			});

			toast.success('Refund marked as completed');
			get().fetchRefunds(); // Refresh the list
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to complete refund';
			toast.error(errorMessage);
			throw error;
		}
	},
}));
