import { create } from 'zustand';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { ApiResponse, Tent, TentState, TentFormData } from '@/types/tent';
import { AxiosError } from 'axios';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

const defaultFormData: TentFormData = {
	name: '',
	description: '',
	facilities: [],
	category_id: '',
	tent_images: [],
};

export const useTentStore = create<TentState>((set, get) => {
	// Helper function to handle API errors
	const handleApiError = (
		error: AxiosError<{ error?: { description?: string }; message?: string }>,
		defaultMessage: string,
	) => {
		console.error(`Error: ${defaultMessage}`, error);
		const errorDescription = error.response?.data?.error?.description;
		const errorMessage =
			errorDescription || error.response?.data?.message || defaultMessage;

		if (error.response?.status === 429) {
			toast.error('Too many requests. Please try again later.');
		} else {
			toast.error(errorMessage);
		}

		set({ isLoading: false });
		return null;
	};

	// Helper function to make authenticated API requests
	const makeAuthenticatedRequest = async <T>(
		method: 'get' | 'put' | 'post' | 'delete' | 'patch',
		endpoint: string,
		data?: unknown,
	): Promise<T | null> => {
		const currentToken = useAuthStore.getState().token;
		const config = {
			headers: {
				Authorization: `Bearer ${currentToken}`,
			},
		};

		try {
			set({ isLoading: true });
			let response;

			switch (method) {
				case 'get':
					response = await api.get(endpoint, config);
					break;
				case 'put':
					response = await api.put(endpoint, data, config);
					break;
				case 'post':
					response = await api.post(endpoint, data, config);
					break;
				case 'delete':
					response = await api.delete(endpoint, config);
					break;
				case 'patch':
					response = await api.patch(endpoint, data, config);
					break;
			}

			set({ isLoading: false });
			return response.data as T;
		} catch (error) {
			return handleApiError(
				error as AxiosError<{
					error?: { description?: string };
					message?: string;
				}>,
				`Failed to ${method} ${endpoint}`,
			);
		}
	};

	return {
		// State
		tents: [],
		isCreateOpen: false,
		isEditOpen: false,
		isDeleteOpen: false,
		isLoading: false,
		selectedTent: null,
		formData: defaultFormData,

		// Actions
		setIsCreateOpen: (isOpen) => {
			set({
				isCreateOpen: isOpen,
				...(isOpen
					? {}
					: {
							selectedTent: null,
							formData: defaultFormData,
					  }),
			});
		},

		setIsEditOpen: (isOpen) => {
			if (!isOpen) {
				set({
					isEditOpen: isOpen,
					selectedTent: null,
					formData: defaultFormData,
				});
			} else {
				set({ isEditOpen: isOpen });
			}
		},

		setIsDeleteOpen: (isOpen) => set({ isDeleteOpen: isOpen }),

		setSelectedTent: (tent) => {
			const currentTent = get().selectedTent;
			if (tent === null || (tent && currentTent?.id !== tent.id)) {
				set({ selectedTent: tent });

				if (tent) {
					if (process.env.NODE_ENV === 'development') {
						console.log('Setting tent data to form:', tent);
					}

					const formDataUpdate: TentFormData = {
						name: tent.name,
						description: tent.description,
						facilities: Array.isArray(tent.facilities) ? tent.facilities : [],
						category_id: tent.category_id,
						tent_images: Array.isArray(tent.tent_images)
							? tent.tent_images
							: [],
					};

					if (process.env.NODE_ENV === 'development') {
						console.log('Updated form data:', formDataUpdate);
					}

					set({ formData: formDataUpdate });
				} else {
					set({ formData: defaultFormData });
				}
			}
		},

		setFormData: (data) =>
			set((state) => ({
				formData: { ...state.formData, ...data },
			})),

		resetForm: () =>
			set({
				formData: defaultFormData,
				selectedTent: null,
				isEditOpen: false,
				isDeleteOpen: false,
			}),

		// API Actions
		getTents: async () => {
			// If we're already fetching, don't start another request
			if (isFetching) {
				return;
			}

			isFetching = true;
			set({ isLoading: true });

			try {
				const response = await makeAuthenticatedRequest<ApiResponse<Tent[]>>(
					'get',
					'/tents',
				);
				if (response?.data) {
					set({ tents: response.data });
				}
			} catch (error) {
				console.error('Failed to fetch tents:', error);
			} finally {
				set({ isLoading: false });
				isFetching = false;
			}
		},

		getTentDetails: async (tentId: string) => {
			try {
				const response = await makeAuthenticatedRequest<ApiResponse<Tent>>(
					'get',
					`/tents/${tentId}`,
				);

				if (response?.data) {
					const tent = response.data;
					set({ selectedTent: tent });
					return tent;
				}
				return null;
			} catch (error) {
				console.error('Failed to fetch tent details:', error);
				return null;
			}
		},

		createTent: async () => {
			try {
				const { formData } = get();

				// Prepare the create data with tent_images array
				const createData = {
					name: formData.name,
					tent_images: formData.tent_images,
					description: formData.description,
					facilities: formData.facilities,
					category_id: formData.category_id,
				};

				const response = await makeAuthenticatedRequest<ApiResponse<Tent>>(
					'post',
					'/tents',
					createData,
				);

				if (response?.data) {
					const { tents } = get();
					const newTent = response.data;
					set({
						tents: [...tents, newTent],
					});

					toast.success('Tent created successfully');
					return {
						success: true,
						message: 'Tent created successfully',
						tentId: newTent.id,
					};
				}

				throw new Error('Invalid response format');
			} catch (error) {
				console.error('Failed to create tent:', error);
				return {
					success: false,
					message: 'Failed to create tent',
					tentId: null,
				};
			}
		},

		updateTent: async (tentId: string) => {
			try {
				const { formData } = get();

				if (!tentId) {
					throw new Error('Tent ID is required for update');
				}

				// Prepare the update data with tent_images array
				const updateData = {
					name: formData.name,
					tent_images: formData.tent_images,
					description: formData.description,
					facilities: formData.facilities,
					category_id: formData.category_id,
				};

				const response = await makeAuthenticatedRequest<ApiResponse<Tent>>(
					'put',
					`/tents/${tentId}`,
					updateData,
				);

				if (response?.data) {
					await get().getTents();
					set({
						isEditOpen: false,
						selectedTent: null,
						formData: defaultFormData,
					});

					toast.success('Tent updated successfully');
					return { success: true, message: 'Tent updated successfully' };
				}

				throw new Error('Invalid response format');
			} catch (error) {
				console.error('Failed to update tent:', error);
				return { success: false, message: 'Failed to update tent' };
			}
		},

		deleteTent: async (tentId: string) => {
			try {
				if (!tentId) {
					throw new Error('Tent ID is required for deletion');
				}

				await makeAuthenticatedRequest('delete', `/tents/${tentId}`);

				const { tents } = get();
				set({
					tents: tents.filter((tent) => tent.id !== tentId),
					isDeleteOpen: false,
					selectedTent: null,
				});

				toast.success('Tent deleted successfully');
				return { success: true, message: 'Tent deleted successfully' };
			} catch (error) {
				console.error('Failed to delete tent:', error);
				return { success: false, message: 'Failed to delete tent' };
			}
		},

		updateTentStatus: async (
			tentId: string,
			status: 'available' | 'unavailable' | 'maintenance',
		) => {
			try {
				if (!tentId) {
					throw new Error('Tent ID is required for status update');
				}

				await makeAuthenticatedRequest('patch', `/tents/${tentId}/status`, {
					status: status,
				});

				// Update the tent in the local state
				const { tents } = get();
				const updatedTents = tents.map((tent) =>
					tent.id === tentId ? { ...tent, status: status } : tent,
				);
				set({ tents: updatedTents });

				toast.success(`Tent status updated to ${status}`);
				return { success: true, message: 'Tent status updated successfully' };
			} catch (error) {
				console.error('Failed to update tent status:', error);
				return { success: false, message: 'Failed to update tent status' };
			}
		},
	};
});
