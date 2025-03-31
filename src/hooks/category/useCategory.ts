import { create } from 'zustand';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { TentCategory, ApiResponse } from '@/types/tent';
import { AxiosError } from 'axios';

// Track if we're currently fetching to prevent duplicate requests
let isFetching = false;

const defaultFormData = {
	name: '',
	weekday_price: 0,
	weekend_price: 0,
	description: '',
	facilities: {},
};

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

	// Actions
	setIsEditOpen: (isOpen: boolean) => void;
	setIsCreateOpen: (isOpen: boolean) => void;
	setIsDeleteOpen: (isOpen: boolean) => void;
	setSelectedCategory: (category: TentCategory | null) => void;
	setFormData: (data: Partial<CategoryState['formData']>) => void;
	resetForm: () => void;

	// API Actions
	getCategories: () => Promise<void>;
	createCategory: () => Promise<{ success: boolean; message: string }>;
	updateCategory: () => Promise<{ success: boolean; message: string }>;
	deleteCategory: () => Promise<{ success: boolean; message: string }>;
};

export const useCategory = create<CategoryState>((set, get) => {
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
			console.log('Rate limit exceeded');
			toast.error('Too many requests. Please try again later.');
		} else {
			toast.error(errorMessage);
		}

		set({ isLoading: false });
		return null;
	};

	// Helper function to make authenticated API requests
	const makeAuthenticatedRequest = async <T>(
		method: 'get' | 'put' | 'post' | 'delete',
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
		categories: [],
		isCreateOpen: false,
		isEditOpen: false,
		isDeleteOpen: false,
		isLoading: false,
		selectedCategory: null,
		formData: defaultFormData,
		error: null,

		// Actions
		setIsCreateOpen: (isOpen: boolean) => {
			set({
				isCreateOpen: isOpen,
				...(isOpen
					? {}
					: {
							selectedCategory: null,
							formData: defaultFormData,
					  }),
			});
		},

		setIsEditOpen: (isOpen: boolean) => {
			if (!isOpen) {
				set({
					isEditOpen: isOpen,
					selectedCategory: null,
					formData: defaultFormData,
				});
			} else {
				set({ isEditOpen: isOpen });
			}
		},

		setIsDeleteOpen: (isOpen: boolean) => set({ isDeleteOpen: isOpen }),

		setSelectedCategory: (category: TentCategory | null) => {
			const currentCategory = get().selectedCategory;
			if (
				category === null ||
				(category && currentCategory?.id !== category.id)
			) {
				set({ selectedCategory: category });

				if (category) {
					if (process.env.NODE_ENV === 'development') {
						console.log('Setting category data to form:', category);
					}

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
			}
		},

		setFormData: (data: Partial<CategoryState['formData']>) =>
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
		getCategories: async () => {
			// If we're already fetching, don't start another request
			if (isFetching) {
				console.log('Skipping duplicate categories API call');
				return;
			}

			isFetching = true;
			set({ isLoading: true });

			try {
				const response = await makeAuthenticatedRequest<
					ApiResponse<TentCategory[]>
				>('get', '/categories');
				if (response?.data) {
					set({ categories: response.data, error: null });
				}
			} catch (error) {
				console.error('Failed to fetch categories:', error);
				set({ error: 'Failed to fetch categories' });
			} finally {
				set({ isLoading: false });
				isFetching = false;
			}
		},

		createCategory: async () => {
			try {
				const { formData } = get();
				console.log('Creating category with data:', formData);

				const response = await makeAuthenticatedRequest<
					ApiResponse<TentCategory>
				>('post', '/categories', formData);

				if (response?.data) {
					const { categories } = get();
					const newCategory = response.data;
					set({
						categories: [...categories, newCategory],
						isCreateOpen: false,
					});

					toast.success('Category created successfully');
					return { success: true, message: 'Category created successfully' };
				}

				throw new Error('Invalid response format');
			} catch (error) {
				console.error('Failed to create category:', error);
				return { success: false, message: 'Failed to create category' };
			}
		},

		updateCategory: async () => {
			try {
				const { formData, selectedCategory } = get();

				if (!selectedCategory) {
					throw new Error('No category selected for update');
				}

				console.log('Updating category with ID:', selectedCategory.id);
				console.log('Updating with data:', formData);

				const response = await makeAuthenticatedRequest<
					ApiResponse<TentCategory>
				>('put', `/categories/${selectedCategory.id}`, formData);

				if (response?.data) {
					await get().getCategories();
					set({
						isEditOpen: false,
						selectedCategory: null,
						formData: defaultFormData,
					});

					toast.success('Category updated successfully');
					return { success: true, message: 'Category updated successfully' };
				}

				throw new Error('Invalid response format');
			} catch (error) {
				console.error('Failed to update category:', error);
				return { success: false, message: 'Failed to update category' };
			}
		},

		deleteCategory: async () => {
			try {
				const { selectedCategory } = get();

				if (!selectedCategory) {
					throw new Error('No category selected for deletion');
				}

				console.log('Deleting category with ID:', selectedCategory.id);

				await makeAuthenticatedRequest(
					'delete',
					`/categories/${selectedCategory.id}`,
				);

				const { categories } = get();
				set({
					categories: categories.filter(
						(category) => category.id !== selectedCategory.id,
					),
					isDeleteOpen: false,
					selectedCategory: null,
				});

				toast.success('Category deleted successfully');
				return { success: true, message: 'Category deleted successfully' };
			} catch (error) {
				console.error('Failed to delete category:', error);
				return { success: false, message: 'Failed to delete category' };
			}
		},
	};
});
