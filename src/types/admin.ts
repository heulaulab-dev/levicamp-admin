// Admin Type Definition
export type Admin = {
	id: string;
	name: string;
	username: string;
	phone: string;
	email: string;
	created_at: string;
	updated_at: string;
	password: string;
};

// Form data for creating/updating admin
export type AdminFormData = {
	name: string;
	username: string;
	password?: string;
	phone: string;
	email: string;
};

// State Type Definition
export type AdminState = {
	// State
	admins: Admin[];
	selectedAdmin: Admin | null;
	isLoading: boolean;
	isCreateModalOpen: boolean;
	isEditModalOpen: boolean;
	isDeleteModalOpen: boolean;
	formData: AdminFormData;

	// Modal Actions
	setIsCreateModalOpen: (isOpen: boolean) => void;
	setIsEditModalOpen: (isOpen: boolean) => void;
	setIsDeleteModalOpen: (isOpen: boolean) => void;
	setSelectedAdmin: (admin: Admin | null) => void;
	setFormData: (data: Partial<AdminFormData>) => void;
	resetFormData: () => void;

	// API Actions
	getAdmins: () => Promise<void>;
	getAdminById: (id: string) => Promise<Admin | null>;
	createAdmin: () => Promise<{ success: boolean; message: string }>;
	updateAdmin: (
		adminId: string,
	) => Promise<{ success: boolean; message: string }>;
	deleteAdmin: () => Promise<{ success: boolean; message: string }>;
};
