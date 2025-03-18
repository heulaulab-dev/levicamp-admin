/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { leviapi } from '@/lib/api';
import { ApiResponse, Tent, TentFormData } from '@/types/types';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface TentState {
	// State
	tents: Tent[];
	isCreateOpen: boolean;
	isEditOpen: boolean;
	isDeleteOpen: boolean;
	isLoading: boolean;
	selectedTent: Tent | null;
	lastFetched: number | null;
	formData: TentFormData;

	// Actions
	setIsCreateOpen: (isOpen: boolean) => void;
	setIsEditOpen: (isOpen: boolean) => void;
	setIsDeleteOpen: (isOpen: boolean) => void;
	setSelectedTent: (tent: Tent | null) => void;
	setFormData: (data: Partial<TentFormData>) => void;
	resetForm: () => void;

	// API Actions
	getTents: (force?: boolean) => Promise<void>;
	getTentDetails: (tentId: string) => Promise<Tent | null>;
	createTent: () => Promise<{
		success: boolean;
		message: string;
		tentId: string | null;
	}>;
	updateTent: (
		tentId: string,
	) => Promise<{ success: boolean; message: string }>;
	deleteTent: (
		tentId: string,
	) => Promise<{ success: boolean; message: string }>;
}

const defaultFormData: TentFormData = {
	name: '',
	tent_image: '',
	tent_images: [],
	description: '',
	facilities: [],
	category_id: '',
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useTentStore = create<TentState>((set, get) => ({
	// State
	tents: [],
	isCreateOpen: false,
	isEditOpen: false,
	isDeleteOpen: false,
	isLoading: false,
	selectedTent: null,
	lastFetched: null,
	formData: defaultFormData,

	// Actions
	setIsCreateOpen: (isOpen) => {
		set({
			isCreateOpen: isOpen,
			// Only reset form data when closing the modal
			...(isOpen
				? {}
				: {
						selectedTent: null,
						formData: defaultFormData,
				  }),
		});
	},
	setIsEditOpen: (isOpen) => {
		// Only reset form data when closing the modal
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
		// Only process if the new tent is different from current selection
		// or if explicitly set to null (for reset)
		const currentTent = get().selectedTent;
		if (tent === null || (tent && currentTent?.id !== tent.id)) {
			// Set the selected tent first
			set({ selectedTent: tent });

			// If a tent is provided, update form data
			if (tent) {
				// In development, we can keep logs
				if (process.env.NODE_ENV === 'development') {
					console.log('Setting tent data to form:', tent);
				}

				const formDataUpdate: TentFormData = {
					name: tent.name,
					tent_image: tent.tent_image,
					description: tent.description || '',
					facilities: Array.isArray(tent.facilities) ? tent.facilities : [],
					category_id: tent.category_id,
					tent_images: [],
				};

				// Add tent_images if available
				if (tent.tent_images && Array.isArray(tent.tent_images)) {
					formDataUpdate.tent_images = tent.tent_images;
				} else {
					// If no tent_images array, create one with the main image
					formDataUpdate.tent_images = tent.tent_image ? [tent.tent_image] : [];
				}

				// In development mode only, log the form data
				if (process.env.NODE_ENV === 'development') {
					console.log('Updated form data:', formDataUpdate);
				}

				// Update form data
				set({ formData: formDataUpdate });
			} else {
				// Reset form when tent is null
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
	getTents: async (force = false) => {
		const state = get();
		const now = Date.now();

		// Return cached data if it's still valid and not forced
		if (
			!force &&
			state.lastFetched &&
			state.tents.length > 0 &&
			now - state.lastFetched < CACHE_DURATION
		) {
			return;
		}

		set({ isLoading: true });
		try {
			const response = await leviapi.get<ApiResponse<Tent[]>>('/tents');
			if (response.data?.data) {
				set({
					tents: response.data.data,
					lastFetched: now,
				});
			}
		} catch (error) {
			console.error('Failed to fetch tents:', error);
			const message =
				(error as AxiosError<ApiResponse<any>>)?.response?.data?.message ||
				'Failed to fetch tents';
			toast.error(message);
		} finally {
			set({ isLoading: false });
		}
	},

	getTentDetails: async (tentId: string) => {
		set({ isLoading: true });
		try {
			console.log('Fetching tent details for ID:', tentId);
			const response = await leviapi.get<ApiResponse<Tent>>(`/tents/${tentId}`);
			console.log('Tent details response:', response.data);
			if (response.data?.data) {
				const tent = response.data.data;
				console.log('Parsed tent data with images:', tent.tent_images);
				set({ selectedTent: tent });
				return tent;
			}
			return null;
		} catch (error) {
			console.error('Failed to fetch tent details:', error);
			const message =
				(error as AxiosError<ApiResponse<any>>)?.response?.data?.message ||
				'Failed to fetch tent details';
			toast.error(message);
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	createTent: async () => {
		set({ isLoading: true });
		try {
			const { formData } = get();
			console.log('Creating tent with data:', formData);

			const response = await leviapi.post<ApiResponse<Tent>>(
				'/tents',
				formData,
			);

			if (response.data?.data) {
				// Update the tents list with the new tent
				const { tents } = get();
				const newTent = response.data.data;
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
			const message =
				(error as AxiosError<ApiResponse<any>>)?.response?.data?.message ||
				'Failed to create tent';
			toast.error(message);
			return { success: false, message, tentId: null };
		} finally {
			set({ isLoading: false });
		}
	},

	updateTent: async (tentId: string) => {
		set({ isLoading: true });
		try {
			const { formData } = get();

			// Ensure we're using the provided tentId
			if (!tentId) {
				throw new Error('Tent ID is required for update');
			}

			// Log the tentId and data to confirm
			console.log('Updating tent with ID:', tentId);
			console.log('Updating with data:', formData);

			const response = await leviapi.put<ApiResponse<Tent>>(
				`/tents/${tentId}`,
				formData,
			);

			if (response.data?.data) {
				// Fetch fresh data to ensure consistency
				await get().getTents(true);
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
			const message =
				(error as AxiosError<ApiResponse<any>>)?.response?.data?.message ||
				'Failed to update tent';
			toast.error(message);
			return { success: false, message };
		} finally {
			set({ isLoading: false });
		}
	},

	deleteTent: async (tentId: string) => {
		set({ isLoading: true });
		try {
			// Ensure we're using the correct tentId
			if (!tentId) {
				throw new Error('Tent ID is required for deletion');
			}

			// Log the tentId to confirm it's correct
			console.log('Deleting tent with ID:', tentId);

			await leviapi.delete(`/tents/${tentId}`);

			// Update local state by removing the deleted tent
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
			const message =
				(error as AxiosError<ApiResponse<any>>)?.response?.data?.message ||
				'Failed to delete tent';
			toast.error(message);
			return { success: false, message };
		} finally {
			set({ isLoading: false });
		}
	},
}));
