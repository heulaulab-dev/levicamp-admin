/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { AdminFormData, AdminState } from '@/types/admin';

// Initial form data
const initialFormData: AdminFormData = {
	name: '',
	username: '',
	password: '',
	phone: '',
	email: '',
};

export const useAdminStore = create<AdminState>((set, get) => ({
	// State
	admins: [],
	selectedAdmin: null,
	isLoading: false,
	isCreateModalOpen: false,
	isEditModalOpen: false,
	isDeleteModalOpen: false,
	formData: initialFormData,

	// Modal Actions
	setIsCreateModalOpen: (isOpen) => {
		set({ isCreateModalOpen: isOpen });
		if (isOpen) {
			get().resetFormData();
		}
	},

	setIsEditModalOpen: (isOpen) => {
		set({ isEditModalOpen: isOpen });
		if (!isOpen) {
			get().resetFormData();
		}
	},

	setIsDeleteModalOpen: (isOpen) => {
		set({ isDeleteModalOpen: isOpen });
	},

	setSelectedAdmin: (admin) => {
		set({ selectedAdmin: admin });
		if (admin) {
			set({
				formData: {
					name: admin.name,
					username: admin.username,
					password: admin.password,
					phone: admin.phone,
					email: admin.email,
				},
			});
		}
	},

	setFormData: (data) => {
		set({ formData: { ...get().formData, ...data } });
	},

	resetFormData: () => {
		set({ formData: initialFormData });
	},

	// API Actions
	getAdmins: async () => {
		set({ isLoading: true, formData: initialFormData });
		const currentToken = useAuthStore.getState().token;
		try {
			const { data } = await api.get('/admins', {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});

			if (data && data.data) {
				set({ admins: data.data });
			} else {
				console.error('Unexpected API response format:', data);
				set({ admins: [] });
			}
		} catch (error) {
			console.error('Error fetching admins:', error);
			toast.error(
				(error as any).response?.data?.error?.description ||
					'Failed to fetch admins',
			);
			set({ admins: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	getAdminById: async (id) => {
		set({ isLoading: true });
		try {
			const response = await api.get(`/admins/${id}`);
			const responseData = response.data;

			if (responseData.status === 'success') {
				return responseData.data;
			} else {
				toast.error('Failed to fetch admin details');
				return null;
			}
		} catch (error) {
			console.error(`Error fetching admin ${id}:`, error);
			toast.error(
				(error as any).response?.data?.error?.description ||
					'Failed to fetch admin details',
			);
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	createAdmin: async () => {
		set({ isLoading: true });
		const currentToken = useAuthStore.getState().token;
		try {
			const { formData } = get();

			const { data } = await api.post('/admins', formData, {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});

			const { admins } = get();
			set({
				admins: [...admins, data.data],
				isLoading: false,
				isCreateModalOpen: false,
			});

			return { success: true, message: 'Admin added successfully!' };
		} catch (error) {
			console.error('Failed to create admin:', error);
			set({ isLoading: false });

			return {
				success: false,
				message:
					(error as any).response?.data?.error?.description ||
					'Failed to create admin',
			};
		}
	},

	updateAdmin: async (adminId) => {
		set({ isLoading: true });
		const { formData, selectedAdmin } = get();
		const currentToken = useAuthStore.getState().token;
		const idToUse = adminId || selectedAdmin?.id;

		if (!idToUse) {
			return {
				success: false,
				message: 'No admin selected for update',
			};
		}

		try {
			const { data } = await api.put(`/admins/${idToUse}`, formData, {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});

			const { admins } = get();
			const updatedAdmins = admins.map((admin) =>
				admin.id === idToUse ? data.data : admin,
			);

			set({
				admins: updatedAdmins,
				isLoading: false,
				isEditModalOpen: false,
			});

			return {
				success: true,
				message: 'Admin updated successfully!',
			};
		} catch (error) {
			console.error('Failed to update admin:', error);
			set({ isLoading: false });

			return {
				success: false,
				message:
					(error as any).response?.data?.error?.description ||
					'Failed to update admin',
			};
		}
	},

	deleteAdmin: async () => {
		set({ isLoading: true });
		const { selectedAdmin } = get();
		const currentToken = useAuthStore.getState().token;
		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const res = await api.delete(`/admins/${selectedAdmin?.id}`, {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});
			const { admins } = get();

			set({
				admins: admins.filter((admin) => admin.id !== selectedAdmin?.id),
				isLoading: false,
				isDeleteModalOpen: false,
			});

			return {
				success: true,
				message: 'Admin deleted successfully!',
			};
		} catch (error) {
			set({ isLoading: false });
			console.error(`Error deleting admin ${selectedAdmin}:`, error);
			const errorMessage =
				(error as any).response?.data?.error?.description ||
				'Failed to delete admin';
			toast.error(errorMessage);
			return {
				success: false,
				message: errorMessage,
			};
		} finally {
			set({ isLoading: false });
		}
	},
}));
