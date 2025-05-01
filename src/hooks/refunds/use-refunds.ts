import { create } from 'zustand';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
	Refund,
	RefundApiResponse,
	RefundListItem,
	RefundDetailItem,
	ApproveRefundRequest,
	RejectRefundRequest,
	RefundState,
	RefundQueryParams,
	RefundResponseDetail,
	RefundCountResponse,
	RefundResponse,
} from '@/types/refund';

// Add request interceptor to always include authorization header
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export const useRefunds = create<RefundState>((set, get) => ({
	refunds: [],
	selectedRefund: null,
	isLoading: false,
	error: null,
	pagination: null,
	pendingCount: 0,

	getRefunds: async (params?: RefundQueryParams) => {
		try {
			set({ isLoading: true, error: null });

			// Build the query string from params
			const queryParams = new URLSearchParams();
			if (params) {
				if (params.order) queryParams.append('order', params.order);
				if (params.page) queryParams.append('page', params.page.toString());
				if (params.page_size)
					queryParams.append('page_size', params.page_size.toString());
				if (params.payment) queryParams.append('payment', params.payment);
				if (params.sort) queryParams.append('sort', params.sort);
				if (params.status) queryParams.append('status', params.status);
			}

			const queryString = queryParams.toString();
			const endpoint = queryString ? `/refunds?${queryString}` : '/refunds';

			const response = await api.get<RefundApiResponse<RefundListItem[]>>(
				endpoint,
			);

			const formattedRefunds: Refund[] = response.data.data.map((refund) => ({
				id: refund.id,
				bookingId: refund.booking_id,
				amount: refund.refund_amount,
				reason: refund.reason,
				status: refund.status,
				date: refund.created_at,
				refundedDate: refund.updated_at,
				guestName: refund.booking?.guest?.name || '',
				refundMethod: refund.refund_method,
				accountName: refund.account_name,
				accountNumber: refund.account_number,
				completedBy: refund.completed_by,
				booking: refund.booking,
				responses: refund.responses,
				paymentProof:
					Array.isArray(refund.responses) && refund.responses.length > 0
						? refund.responses[0].payment_proof
						: (refund.responses as RefundResponse)?.payment_proof,
				rejectReason: Array.isArray(refund.responses)
					? refund.responses.find((r) => r.status === 'rejected')
							?.additional_info
					: (refund.responses as RefundResponse)?.status === 'rejected'
					? (refund.responses as RefundResponse).additional_info
					: undefined,
			}));

			set({
				refunds: formattedRefunds,
				isLoading: false,
				pagination: response.data.pagination || null,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to fetch refunds';
			set({ error: errorMessage, isLoading: false });
			toast.error(errorMessage);
		}
	},

	pendingNotificationRefund: async () => {
		try {
			set({ isLoading: true, error: null });

			const response = await api.get<RefundApiResponse<RefundCountResponse>>(
				'/refunds/count',
			);

			const count = response.data.data.count;
			set({
				pendingCount: count,
				isLoading: false,
			});

			return count;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to fetch pending refund count';

			set({
				error: errorMessage,
				isLoading: false,
			});

			console.error(errorMessage);
			return 0; // Return 0 if there's an error
		}
	},

	getRefundById: async (id: string) => {
		try {
			set({ isLoading: true, error: null });

			const response = await api.get<RefundApiResponse<RefundDetailItem>>(
				`/refunds/${id}`,
			);

			const refund = response.data.data;

			// Map to consistent format for UI
			const formattedRefund: RefundDetailItem = {
				...refund,
				// Ensure responses is correctly typed, could be a single object or an array
				responses: refund.responses,
				// Add helper fields for compatibility with UI components
				payment_proof:
					Array.isArray(refund.responses) && refund.responses.length > 0
						? refund.responses[0].payment_proof
						: (refund.responses as RefundResponse)?.payment_proof,
				reject_reason: Array.isArray(refund.responses)
					? refund.responses.find((r) => r.status === 'rejected')
							?.additional_info
					: (refund.responses as RefundResponse)?.status === 'rejected'
					? (refund.responses as RefundResponse).additional_info
					: undefined,
			};

			set({
				selectedRefund: formattedRefund,
				isLoading: false,
			});

			return formattedRefund;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: `Failed to fetch refund with ID: ${id}`;
			set({ error: errorMessage, isLoading: false });
			toast.error(errorMessage);
			throw error;
		}
	},

	approveRefund: async (id: string, data: ApproveRefundRequest) => {
		try {
			set({ isLoading: true, error: null });

			const response = await api.post<RefundApiResponse<RefundResponseDetail>>(
				`/refunds/${id}/approve`,
				data,
			);

			const responseData = response.data.data;

			toast.success('Refund approved successfully');

			// Refresh the refund list
			get().getRefunds();

			// If we have a selected refund and it matches this ID, update it
			const currentSelected = get().selectedRefund;
			if (currentSelected && currentSelected.id === id) {
				// Refresh the refund details to reflect the changes
				get().getRefundById(id);
			}

			set({ isLoading: false });

			return responseData;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to approve refund';
			set({ error: errorMessage, isLoading: false });
			toast.error(errorMessage);
			throw error;
		}
	},

	rejectRefund: async (id: string, data: RejectRefundRequest) => {
		try {
			set({ isLoading: true, error: null });

			const response = await api.post<RefundApiResponse<RefundResponseDetail>>(
				`/refunds/${id}/reject`,
				data,
			);

			const responseData = response.data.data;

			toast.success('Refund rejected successfully');

			// Refresh the refund list
			get().getRefunds();

			// If we have a selected refund and it matches this ID, update it
			const currentSelected = get().selectedRefund;
			if (currentSelected && currentSelected.id === id) {
				// Refresh the refund details to reflect the changes
				get().getRefundById(id);
			}

			set({ isLoading: false });

			return responseData;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to reject refund';
			set({ error: errorMessage, isLoading: false });
			toast.error(errorMessage);
			throw error;
		}
	},

	completeRefund: async (id: string) => {
		try {
			set({ isLoading: true, error: null });

			const response = await api.post<RefundApiResponse<RefundResponseDetail>>(
				`/refunds/${id}/complete`,
			);

			const responseData = response.data.data;

			toast.success('Refund marked as completed');

			// Refresh the refund list
			get().getRefunds();

			// If we have a selected refund and it matches this ID, update it
			const currentSelected = get().selectedRefund;
			if (currentSelected && currentSelected.id === id) {
				// Refresh the refund details to reflect the changes
				get().getRefundById(id);
			}

			set({ isLoading: false });

			return responseData;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to complete refund';
			set({ error: errorMessage, isLoading: false });
			toast.error(errorMessage);
			throw error;
		}
	},
}));
