export interface TentState {
	// State
	tents: Tent[];
	isCreateOpen: boolean;
	isEditOpen: boolean;
	isDeleteOpen: boolean;
	isLoading: boolean;
	selectedTent: Tent | null;
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
	updateTentStatus: (
		tentId: string,
		status: 'available' | 'unavailable' | 'maintenance',
	) => Promise<{ success: boolean; message: string }>;
}

export interface Tent {
	id: string;
	name: string;
	tent_image: string;
	tent_images?: string[];
	description: string;
	facilities: string[];
	category_id: string;
	category: Category;
	status: 'available' | 'unavailable' | 'maintenance';
	weekday_price: number;
	weekend_price: number;
	created_at: string;
	updated_at: string;
}

export interface TentFormData {
	name: string;
	tent_images: string[];
	description: string;
	facilities: string[];
	category_id: string;
}

export interface TentCategory {
	id: string;
	name: string;
	weekday_price: number;
	weekend_price: number;
	facilities: Record<string, string> | null;
	description: string;
	created_at: string;
	updated_at: string;
}

export interface Category {
	id: string;
	name: string;
	weekday_price: number;
	weekend_price: number;
	facilities: Record<string, string>;
	description: string;
	created_at: string;
	updated_at: string;
}

export interface Tents {
	id: string;
	name: string;
	tent_image: string;
	tent_images?: string[];
	description: string;
	facilities: string[];
	category_id: string;
	category: TentCategory;
	status: 'available' | 'unavailable' | 'maintenance';
	weekday_price: number;
	weekend_price: number;
	created_at: string;
	updated_at: string;
}

export interface UpdateTentResponse {
	success: boolean;
	message: string;
}

export interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
}
