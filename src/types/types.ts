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
	description: string;
	facilities: string[];
	category_id: string;
	category: TentCategory;
	status: 'available' | 'unavailable';
	weekday_price: number;
	weekend_price: number;
	created_at: string;
	updated_at: string;
}

export interface UpdateTentResponse {
	success: boolean;
	message: string;
}

export interface Tent {
	id: string;
	name: string;
	tent_image: string;
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
	tent_image: string;
	description: string;
	facilities: string[];
	category_id: string;
}

export interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
}