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
