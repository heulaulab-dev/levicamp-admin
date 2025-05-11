import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

// UI Components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// API and utilities
import api from '@/lib/api';

type ImageUploaderProps = {
	onImageUploaded: (imageUrl: string) => void;
	articleId?: string | number;
	folder?: string;
};

export function ImageUploader({
	onImageUploaded,
	articleId,
	folder = 'articles',
}: ImageUploaderProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Create folder path based on article ID
	const getFolderPath = useCallback(() => {
		// Base path is 'articles'
		let path = folder;

		// If article ID is provided, create a subfolder
		if (articleId) {
			path = `${path}/${articleId}`;
		}

		return path;
	}, [folder, articleId]);

	// Cleanup preview URL when component unmounts
	const cleanupPreview = useCallback(() => {
		if (previewUrl && previewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		}
	}, [previewUrl]);

	// Handle file selection
	const handleFileSelect = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	// Handle file change
	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				const file = e.target.files[0];

				// Check if file is an image
				if (!file.type.startsWith('image/')) {
					toast.error('Please select an image file');
					return;
				}

				// Size validation (5MB)
				if (file.size > 5 * 1024 * 1024) {
					toast.error('Image exceeds the 5MB size limit');
					return;
				}

				// Clean up existing preview
				cleanupPreview();

				// Create new preview
				setPreviewUrl(URL.createObjectURL(file));

				// Auto upload the file
				uploadFile(file);
			}

			// Reset the input to allow selecting the same file again
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		},
		[cleanupPreview],
	);

	// Upload file function
	const uploadFile = useCallback(
		async (file: File) => {
			setIsUploading(true);
			setUploadProgress(0);

			try {
				// Create FormData for the file
				const formData = new FormData();
				formData.append('files', file);
				formData.append('folder', getFolderPath());

				const response = await api.post('/upload/article', formData, {
					onUploadProgress: (progressEvent: {
						loaded: number;
						total?: number;
					}) => {
						if (progressEvent.total) {
							const percentCompleted = Math.round(
								(progressEvent.loaded * 100) / progressEvent.total,
							);
							setUploadProgress(percentCompleted);
						}
					},
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});

				// Check for urls array in the response
				if (response.data?.data?.urls && response.data.data.urls.length > 0) {
					const url = response.data.data.urls[0];

					// Notify parent component with the URL
					onImageUploaded(url);

					toast.success('Image uploaded successfully');
				} else {
					throw new Error(
						'Invalid response format - expected urls array in response',
					);
				}
			} catch (error) {
				console.error('Upload error:', error);
				toast.error('Failed to upload image');
			} finally {
				setIsUploading(false);
			}
		},
		[getFolderPath, onImageUploaded],
	);

	// Cancel upload and reset
	const handleCancel = useCallback(() => {
		cleanupPreview();
		setIsUploading(false);
		setUploadProgress(0);
	}, [cleanupPreview]);

	return (
		<div className='w-full'>
			<input
				type='file'
				ref={fileInputRef}
				onChange={handleFileChange}
				accept='image/*'
				className='hidden'
			/>

			{!previewUrl ? (
				<Button
					type='button'
					variant='outline'
					onClick={handleFileSelect}
					className='flex flex-col gap-2 border-dashed w-full h-32'
					disabled={isUploading}
				>
					<Upload className='w-6 h-6' />
					<span>Upload Image</span>
				</Button>
			) : (
				<div className='relative border rounded-md overflow-hidden'>
					{/* Image preview */}
					<div className='flex justify-center items-center bg-muted aspect-video'>
						<div className='relative w-full h-full'>
							<Image
								src={previewUrl}
								alt='Image preview'
								fill
								className='object-contain'
							/>
						</div>
					</div>

					{/* Progress bar during upload */}
					{isUploading && (
						<div className='p-2'>
							<Progress value={uploadProgress} className='h-1' />
							<span className='mt-1 text-muted-foreground text-xs'>
								{uploadProgress}%
							</span>
						</div>
					)}

					{/* Cancel button */}
					<button
						type='button'
						onClick={handleCancel}
						className='top-1 right-1 absolute bg-background/80 p-1 rounded-full'
					>
						<X className='w-4 h-4' />
					</button>
				</div>
			)}
		</div>
	);
}
