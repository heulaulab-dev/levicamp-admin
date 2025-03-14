/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { leviapi } from '@/lib/api';
import { Tents } from '@/types/types';

type TentState = {
	// State
	tents: Tents[];
	isCreateOpen: boolean;
	isEditOpen: boolean;
	isDeleteOpen: boolean;
	isLoading: boolean;
	selectedTent: Tents | null;
	formData: {
		name: string;
		tent_image: string;
		description: string;
		facilities: string[];
		category_id: string;
	};

	// Actions
	setIsEditOpen: (isOpen: boolean) => void;
	setIsCreateOpen: (isOpen: boolean) => void;
	setIsDeleteOpen: (isOpen: boolean) => void;
	setSelectedTent: (tent: Tents | null) => void;
	setFormData: (data: Partial<TentState['formData']>) => void;
	resetForm: () => void;

	// API Actions
	getTents: () => Promise<void>;
	getTentDetails: (tentId: string) => Promise<Tents | null>;
	createTent: () => Promise<{ success: boolean; message: string }>;
	updateTent: (
		tentId?: string,
	) => Promise<{ success: boolean; message: string }>;
	deleteTent: () => Promise<{ success: boolean; message: string }>;
};

const defaultFormData = {
	name: '',
	tent_image: '',
	description: '',
	facilities: [],
	category_id: '',
};

export const useTentStore = create<TentState>((set, get) => ({
	// State
	tents: [],
	isCreateOpen: false,
	isEditOpen: false,
	isDeleteOpen: false,
	isLoading: false,
	selectedTent: null,
	formData: defaultFormData,

	// Actions
	setIsCreateOpen: (isOpen: boolean) => {
		set((state) => ({
			...state,
			isCreateOpen: isOpen,
			...(isOpen
				? {
						selectedTent: null,
						formData: { ...defaultFormData },
				  }
				: {}),
		}));
	},
	setIsEditOpen: (isOpen: boolean) => set({ isEditOpen: isOpen }),
	setIsDeleteOpen: (isOpen: boolean) => set({ isDeleteOpen: isOpen }),
	setSelectedTent: (tent) => {
		set({ selectedTent: tent });
		if (tent) {
			set({
				formData: {
					name: tent.name,
					tent_image: tent.tent_image,
					description: tent.description,
					facilities: tent.facilities,
					category_id: tent.category_id,
				},
			});
		} else {
			set({ formData: { ...defaultFormData } });
		}
	},
	setFormData: (data) => {
		set(
			(state) => ({
				formData: {
					...state.formData,
					...data,
				},
			}),
			false,
		);
	},
	resetForm: () => {
		set((state) => ({
			...state,
			formData: { ...defaultFormData },
			selectedTent: null,
		}));
	},

	// API Actions
	getTents: async () => {
		set({ isLoading: true });
		try {
			const { data } = await leviapi.get('/tents');
			console.log('API response:', data);

			if (data && data.data) {
				set({ tents: data.data });
			} else {
				console.error('Unexpected API response format:', data);
				set({ tents: [] });
			}
		} catch (error) {
			console.error('Failed to fetch tents:', error);
			set({ tents: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	getTentDetails: async (tentId) => {
		set({ isLoading: true });
		try {
			const { data } = await leviapi.get(`/tents/${tentId}`);

			if (data && data.data) {
				const tentDetails = data.data;
				set({
					selectedTent: tentDetails,
					formData: {
						name: tentDetails.name,
						tent_image: tentDetails.tent_image,
						description: tentDetails.description,
						facilities: tentDetails.facilities,
						category_id: tentDetails.category_id,
					},
				});
				return tentDetails;
			} else {
				console.error('Unexpected API response format:', data);
				return null;
			}
		} catch (error) {
			console.error('Failed to fetch tent details:', error);
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	createTent: async () => {
		set({ isLoading: true });
		try {
			const { formData } = get();
			const { data } = await leviapi.post('/tents', formData);

			const { tents } = get();
			set({
				tents: [...tents, data.data],
				isLoading: false,
				isCreateOpen: false,
			});

			return { success: true, message: 'Tent added successfully!' };
		} catch (error) {
			console.error('Failed to create tent:', error);
			set({ isLoading: false });

			return {
				success: false,
				message: (error as any).response?.data?.message || 'Failed to add tent',
			};
		}
	},

	updateTent: async (tentId) => {
		set({ isLoading: true });
		const { formData, selectedTent } = get();

		// Use tentId if provided, otherwise fall back to selectedTent
		const idToUse = tentId || selectedTent?.id;

		if (!idToUse) {
			return {
				success: false,
				message: 'No tent selected for update',
			};
		}

		try {
			const { data } = await leviapi.put(`/tents/${idToUse}`, formData);

			const { tents } = get();
			// Update the tent in the list
			const updatedTents = tents.map((tent) =>
				tent.id === idToUse ? data.data : tent,
			);

			set({
				tents: updatedTents,
				isLoading: false,
				isEditOpen: false,
			});

			return {
				success: true,
				message: 'Tent updated successfully!',
			};
		} catch (error) {
			console.error('Failed to update tent:', error);
			set({ isLoading: false });

			return {
				success: false,
				message:
					(error as any).response?.data?.message || 'Failed to update tent',
			};
		}
	},

	deleteTent: async () => {
		const { selectedTent } = get();
		if (!selectedTent) {
			return {
				success: false,
				message: 'No tent selected for deletion',
			};
		}

		set({ isLoading: true });
		try {
			await leviapi.delete(`/tents/${selectedTent.id}`);

			const { tents } = get();
			set({
				tents: tents.filter((tent) => tent.id !== selectedTent.id),
				isLoading: false,
				isDeleteOpen: false,
			});

			return {
				success: true,
				message: 'Tent deleted successfully!',
			};
		} catch (error) {
			console.error('Failed to delete tent:', error);
			set({ isLoading: false });

			return {
				success: false,
				message:
					(error as any).response?.data?.message || 'Failed to delete tent',
			};
		}
	},
}));
