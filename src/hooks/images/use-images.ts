import { create } from 'zustand';
import { leviapi } from '@/lib/api';
import { toast } from 'sonner';

interface UploadProgress {
	id: string;
	filename: string;
	progress: number;
	status: 'idle' | 'uploading' | 'success' | 'error';
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

			// Add folder name
			formData.append('folder', folderName);

			// Make the API request
			const response = await leviapi.post('/upload/tents', formData, {
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

			// Update progress to error
			set((state) => ({
				uploadProgress: state.uploadProgress.map((item) => ({
					...item,
					status: 'error',
				})),
				isUploading: false,
			}));

			toast.error('Failed to upload images');
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
