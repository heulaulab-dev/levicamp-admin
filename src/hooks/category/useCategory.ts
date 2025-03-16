/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { leviapi } from '@/lib/api';
import { persist } from 'zustand/middleware';
import { TentCategory } from '@/types/types';

type CategoryState = {
	// State
	categories: TentCategory[];
	isCreateOpen: boolean;
	isEditOpen: boolean;
	isDeleteOpen: boolean;
	isLoading: boolean;
	selectedCategory: TentCategory | null;
	formData: {
		name: string;
		weekday_price: number;
		weekend_price: number;
		description: string;
		facilities: Record<string, string>;
	};
	error: string | null;
	lastFetched: number | null;

	// Actions
	setIsEditOpen: (isOpen: boolean) => void;
	setIsCreateOpen: (isOpen: boolean) => void;
	setIsDeleteOpen: (isOpen: boolean) => void;
	setSelectedCategory: (category: TentCategory | null) => void;
	setFormData: (data: Partial<CategoryState['formData']>) => void;
	resetForm: () => void;

	// API Actions
	getCategories: (force?: boolean) => Promise<void>;
	createCategory: () => Promise<{ success: boolean; message: string }>;
	updateCategory: () => Promise<{ success: boolean; message: string }>;
	deleteCategory: () => Promise<{ success: boolean; message: string }>;
};

const defaultFormData = {
	name: '',
	weekday_price: 0,
	weekend_price: 0,
	description: '',
	facilities: {},
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useCategory = create<CategoryState>()(
	persist(
		(set, get) => ({
			// State
			categories: [],
			isCreateOpen: false,
			isEditOpen: false,
			isDeleteOpen: false,
			isLoading: false,
			selectedCategory: null,
			formData: defaultFormData,
			error: null,
			lastFetched: null,

			// Actions
			setIsCreateOpen: (isOpen: boolean) => {
				set({
					isCreateOpen: isOpen,
					selectedCategory: null,
					formData: defaultFormData,
				});
			},
			setIsEditOpen: (isOpen: boolean) => set({ isEditOpen: isOpen }),
			setIsDeleteOpen: (isOpen: boolean) => set({ isDeleteOpen: isOpen }),
			setSelectedCategory: (category) => {
				set({ selectedCategory: category });
				if (category) {
					set({
						formData: {
							name: category.name,
							weekday_price: category.weekday_price,
							weekend_price: category.weekend_price,
							description: category.description || '',
							facilities: category.facilities || {},
						},
					});
				} else {
					set({ formData: defaultFormData });
				}
			},
			setFormData: (data) =>
				set((state) => ({
					formData: { ...state.formData, ...data },
				})),
			resetForm: () =>
				set({
					formData: defaultFormData,
					selectedCategory: null,
					isEditOpen: false,
					isDeleteOpen: false,
				}),

			// API Actions
			getCategories: async (force = false) => {
				const state = get();
				const now = Date.now();

				// Return cached data if it's still valid and not forced
				if (
					!force &&
					state.lastFetched &&
					state.categories.length > 0 &&
					now - state.lastFetched < CACHE_DURATION
				) {
					return;
				}

				set({ isLoading: true });
				try {
					const res = await leviapi.get('/categories');
					if (res.data && res.data.data) {
						set({
							categories: res.data.data,
							lastFetched: now,
							error: null,
						});
					} else {
						console.error('Unexpected API response format:', res.data);
						set({
							categories: [],
							error: 'Invalid response format',
						});
					}
				} catch (error) {
					console.error('Failed to fetch categories:', error);
					set({
						categories: [],
						error: 'Failed to fetch categories',
					});
				} finally {
					set({ isLoading: false });
				}
			},

			createCategory: async () => {
				set({ isLoading: true });
				try {
					const { formData } = get();
					const res = await leviapi.post('/categories', formData);

					// If successful, update the categories list
					const { categories } = get();
					set({
						categories: [...categories, res.data.data],
						isLoading: false,
						isCreateOpen: false, // Close the dialog on success
					});

					// Return success status and message
					return { success: true, message: 'Category added successfully!' };
				} catch (error) {
					console.error('Failed to create category:', error);
					set({ isLoading: false });

					// Return error message
					return {
						success: false,
						message:
							(error as any).response?.data?.message ||
							'Failed to add category',
					};
				}
			},

			updateCategory: async () => {
				set({ isLoading: true });
				const { formData, selectedCategory } = get();
				if (!selectedCategory) {
					return {
						success: false,
						message: 'No category selected for update',
					};
				}

				try {
					const res = await leviapi.put(
						`/categories/${selectedCategory.id}`,
						formData,
					);

					// If successful, update the categories list
					const { categories } = get();
					set({
						categories: [...categories, res.data.data],
						isLoading: false,
						isEditOpen: false, //
					});

					// Return success status and message
					return {
						success: true,
						message: 'Category updated successfully!',
					};
				} catch (error) {
					console.error('Failed to update category:', error);
					set({ isLoading: false });

					// Return error message
					return {
						success: false,
						message:
							(error as any).response?.data?.message ||
							'Failed to update category',
					};
				}
			},

			deleteCategory: async () => {
				const { selectedCategory } = get();
				if (!selectedCategory) {
					return {
						success: false,
						message: 'No category selected for deletion',
					};
				}

				set({ isLoading: true });
				try {
					const res = await leviapi.delete(
						`/categories/${selectedCategory.id}`,
					);

					// If successful, update the categories by refreshing the list
					const { categories } = get();
					set({
						categories: [...categories, res.data.data],
						isLoading: false,
						isEditOpen: false,
					});

					// Return success status and message
					return {
						success: true,
						message: 'Category deleted successfully!',
					};
				} catch (error) {
					console.error('Failed to delete category:', error);
					set({ isLoading: false });

					// Return error message
					return {
						success: false,
						message:
							(error as any).response?.data?.message ||
							'Failed to delete category',
					};
				}
			},
		}),
		{
			name: 'category-storage',
			partialize: (state) => ({
				categories: state.categories,
				lastFetched: state.lastFetched,
			}),
		},
	),
);
