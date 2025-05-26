import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export interface Article {
	id: number;
	title: string;
	summary: string;
	content: string;
	author: string;
	published_at: string;
	image: string;
	tags: string[];
	status: 'published' | 'draft';
	created_at: string;
	updated_at: string;
}

interface ArticleFormData {
	title: string;
	summary: string;
	content: string;
	author: string;
	published_at: string;
	image: string;
	tags: string[];
	status: 'published' | 'draft';
}

interface ArticleState {
	articles: Article[];
	isLoading: boolean;
	error: string | null;
	isCreateOpen: boolean;
	isEditOpen: boolean;
	isDeleteOpen: boolean;
	selectedArticle: Article | null;
	formData: ArticleFormData;
	setIsCreateOpen: (open: boolean) => void;
	setIsEditOpen: (open: boolean) => void;
	setIsDeleteOpen: (open: boolean) => void;
	setSelectedArticle: (article: Article | null) => void;
	setFormData: (data: Partial<ArticleFormData>) => void;
	resetForm: () => void;
	getArticles: () => Promise<void>;
	getArticleById: (id: number) => Promise<boolean>;
	createArticle: () => Promise<boolean>;
	updateArticle: (closeDialog?: boolean) => Promise<boolean>;
	deleteArticle: (id: number) => Promise<boolean>;
}

const defaultFormData: ArticleFormData = {
	title: '',
	summary: '',
	content: '',
	author: '',
	published_at: '',
	image: '',
	tags: [],
	status: 'draft',
};

function extractErrorMessage(error: unknown, fallback: string): string {
	if (
		error &&
		typeof error === 'object' &&
		(error as AxiosError).isAxiosError
	) {
		const axiosError = error as AxiosError<{
			error?: string | { description?: string };
		}>;
		const errData = axiosError.response?.data?.error;
		if (typeof errData === 'string') {
			return errData;
		} else if (
			typeof errData === 'object' &&
			errData &&
			'description' in errData
		) {
			return (errData as { description?: string }).description || fallback;
		}
	}
	return fallback;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
	articles: [],
	isLoading: false,
	error: null,
	isCreateOpen: false,
	isEditOpen: false,
	isDeleteOpen: false,
	selectedArticle: null,
	formData: { ...defaultFormData },
	setIsCreateOpen: (open) => set({ isCreateOpen: open }),
	setIsEditOpen: (open) => set({ isEditOpen: open }),
	setIsDeleteOpen: (open) => set({ isDeleteOpen: open }),
	setSelectedArticle: (article) => set({ selectedArticle: article }),
	setFormData: (data) =>
		set((state) => ({ formData: { ...state.formData, ...data } })),
	resetForm: () => set({ formData: { ...defaultFormData } }),

	getArticles: async () => {
		set({ isLoading: true });
		try {
			const res = await api.get('/articles');
			set({ articles: res.data, error: null });
		} catch (error: unknown) {
			const errorMsg = extractErrorMessage(error, 'Failed to fetch articles');
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	getArticleById: async (id) => {
		set({ isLoading: true });
		try {
			const res = await api.get(`/articles/${id}`);
			set({
				selectedArticle: res.data,
				formData: {
					title: res.data.title || '',
					summary: res.data.summary || '',
					content: res.data.content || '',
					author: res.data.author || '',
					published_at: res.data.published_at || '',
					image: res.data.image || '',
					tags: res.data.tags || [],
					status: res.data.status || 'draft',
				},
				error: null,
			});
			return true;
		} catch (error: unknown) {
			const errorMsg = extractErrorMessage(
				error,
				`Failed to fetch article #${id}`,
			);
			set({ error: errorMsg });
			toast.error(errorMsg);
			return false;
		} finally {
			set({ isLoading: false });
		}
	},

	createArticle: async () => {
		set({ isLoading: true });
		try {
			const { formData } = get();
			await api.post('/articles', formData);
			await get().getArticles();
			set({ isCreateOpen: false });
			toast.success('Article saved');
			return true;
		} catch (error: unknown) {
			const errorMsg = extractErrorMessage(error, 'Failed to create article');
			toast.error(errorMsg);
			return false;
		} finally {
			set({ isLoading: false });
		}
	},

	updateArticle: async (closeDialog = true) => {
		set({ isLoading: true });
		try {
			const { formData, selectedArticle } = get();
			if (!selectedArticle) return false;
			await api.put(`/articles/${selectedArticle.id}`, formData);
			await get().getArticles();
			if (closeDialog) {
				set({ isEditOpen: false });
			}
			toast.success('Article saved');
			return true;
		} catch (error: unknown) {
			const errorMsg = extractErrorMessage(error, 'Failed to update article');
			toast.error(errorMsg);
			return false;
		} finally {
			set({ isLoading: false });
		}
	},

	deleteArticle: async (id) => {
		set({ isLoading: true });
		try {
			await api.delete(`/articles/${id}`);
			await get().getArticles();
			set({ isDeleteOpen: false });
			toast.success('Article deleted');
			return true;
		} catch (error: unknown) {
			const errorMsg = extractErrorMessage(error, 'Failed to delete article');
			toast.error(errorMsg);
			return false;
		} finally {
			set({ isLoading: false });
		}
	},
}));
