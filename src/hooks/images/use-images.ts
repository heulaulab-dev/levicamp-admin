import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface UploadProgress {
	id: string;
	filename: string;
	progress: number;
	status: 'idle' | 'uploading' | 'success' | 'error';
}

interface ValidationError {
	code: string;
	description: string;
	details: Record<string, string>;
}

interface ApiErrorResponse {
	status: number;
	message: string;
	error: ValidationError;
}

interface ImagesState {
	// Image URLs from the API response
	imageUrls: string[];

	// Upload progress for each file
	uploadProgress: UploadProgress[];

	// Loading state
	isUploading: boolean;

	// Methods
	uploadImages: (files: File[], folderName: string) => Promise<string[]>;
	resetImages: () => void;
	removeImage: (url: string) => void;
}

export const useImagesStore = create<ImagesState>((set) => ({
	imageUrls: [],
	uploadProgress: [],
	isUploading: false,

	uploadImages: async (files: File[], folderName: string) => {
		if (files.length === 0) return [];

		if (!folderName) {
			toast.error('Folder name is required');
			return [];
		}

		set({ isUploading: true });

		// Create initial progress entries for each file
		const initialProgress: UploadProgress[] = files.map((file) => ({
			id: Math.random().toString(36).substring(2, 9),
			filename: file.name,
			progress: 0,
			status: 'uploading',
		}));

		set({ uploadProgress: initialProgress });

		try {
			const formData = new FormData();

			// Append each file to form data with the same field name 'files'
			files.forEach((file) => {
				formData.append('files', file);
			});

			// Add folder name with proper casing as expected by the API
			formData.append('folder', folderName);

			// Make the API request
			const response = await api.post('/upload/tents', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				onUploadProgress: (progressEvent) => {
					const percentCompleted = Math.round(
						(progressEvent.loaded * 100) / (progressEvent.total || 100),
					);

					// Update progress for all files (since it's a single request)
					set((state) => ({
						uploadProgress: state.uploadProgress.map((item) => ({
							...item,
							progress: percentCompleted,
						})),
					}));
				},
			});

			// Update progress to success
			set((state) => ({
				uploadProgress: state.uploadProgress.map((item) => ({
					...item,
					progress: 100,
					status: 'success',
				})),
			}));

			if (response.data.status === 201) {
				const newUrls = response.data.data.urls;
				set((state) => ({
					imageUrls: [...state.imageUrls, ...newUrls],
					isUploading: false,
				}));

				toast.success('Images uploaded successfully');
				return newUrls;
			} else {
				throw new Error('Upload failed');
			}
		} catch (error) {
			console.error('Error uploading images:', error);

			// Handle validation errors
			const axiosError = error as AxiosError<ApiErrorResponse>;
			if (axiosError.response?.data?.error?.code === 'VALIDATION_ERROR') {
				const details = axiosError.response.data.error.details;
				Object.entries(details).forEach(([field, message]) => {
					toast.error(`${field}: ${message}`);
				});
			} else {
				toast.error('Failed to upload images');
			}

			// Update progress to error
			set((state) => ({
				uploadProgress: state.uploadProgress.map((item) => ({
					...item,
					status: 'error',
				})),
				isUploading: false,
			}));

			return [];
		}
	},

	resetImages: () => {
		set({
			imageUrls: [],
			uploadProgress: [],
			isUploading: false,
		});
	},

	removeImage: (url: string) => {
		set((state) => ({
			imageUrls: state.imageUrls.filter((imageUrl) => imageUrl !== url),
		}));
	},
}));
