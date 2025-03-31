/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { toast } from 'sonner';
import { Upload, X, ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

// UI Components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

// API and utilities
import api from '@/lib/api';

// Helper to format folder name
const formatFolderName = (name: string): string => {
	// Replace spaces with underscores, remove special characters
	return (
		name
			.trim()
			.replace(/\s+/g, '_')
			.replace(/[^\w_]/g, '') || 'unnamed_tent'
	);
};

// Types
type TentImagesUploaderProps = {
	tentName: string;
	onImagesChange: (imageUrls: string[]) => void;
	initialImages?: string[];
};

type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

type FileInfo = {
	id: string;
	file: File;
	preview: string;
	status: FileStatus;
	progress: number;
	url?: string;
};

// Memoized image preview component to reduce re-renders
const ImagePreview = memo(
	({
		src,
		alt,
		className,
	}: {
		src: string;
		alt: string;
		className?: string;
	}) => (
		<div className='relative w-full h-full'>
			<Image
				src={src}
				alt={alt}
				fill
				className={`object-contain ${className || ''}`}
			/>
		</div>
	),
);
ImagePreview.displayName = 'ImagePreview';

// Memoized file item component
const FileItem = memo(
	({
		fileInfo,
		onRemove,
	}: {
		fileInfo: FileInfo;
		onRemove: (id: string) => void;
	}) => (
		<div className='relative border rounded-md overflow-hidden'>
			{/* Image preview */}
			<div className='flex justify-center items-center bg-muted aspect-video'>
				<ImagePreview
					src={fileInfo.preview}
					alt={`Preview ${fileInfo.file.name}`}
				/>
			</div>

			{/* File info and status */}
			<div className='bg-background p-2'>
				<p className='font-medium text-xs truncate'>{fileInfo.file.name}</p>
				<p className='text-muted-foreground text-xs'>
					{(fileInfo.file.size / 1024).toFixed(2)} KB
				</p>

				{/* Upload progress */}
				{fileInfo.status === 'uploading' && (
					<div className='mt-2'>
						<Progress value={fileInfo.progress} className='h-1' />
						<span className='mt-1 text-muted-foreground text-xs'>
							{fileInfo.progress}%
						</span>
					</div>
				)}

				{/* Status indicators */}
				{fileInfo.status === 'success' && (
					<div className='flex items-center mt-2 text-green-500 text-xs'>
						<CheckCircle className='mr-1 w-3 h-3' />
						Uploaded
					</div>
				)}

				{fileInfo.status === 'error' && (
					<div className='flex items-center mt-2 text-red-500 text-xs'>
						<AlertCircle className='mr-1 w-3 h-3' />
						Failed
					</div>
				)}
			</div>

			{/* Remove button */}
			<button
				type='button'
				onClick={() => onRemove(fileInfo.id)}
				className='top-1 right-1 absolute bg-background/80 p-1 rounded-full'
			>
				<X className='w-4 h-4' />
			</button>
		</div>
	),
);
FileItem.displayName = 'FileItem';

// Memoized uploaded image item component
const UploadedImageItem = memo(
	({
		url,
		index,
		onRemove,
	}: {
		url: string;
		index: number;
		onRemove: (index: number) => void;
	}) => (
		<div className='relative border rounded-md overflow-hidden'>
			<div className='flex justify-center items-center bg-muted aspect-video'>
				<ImagePreview src={url} alt={`Uploaded ${index + 1}`} />
			</div>
			<div className='bg-background p-2'>
				<p className='font-medium text-xs'>Image {index + 1}</p>
				<div className='flex items-center mt-1 text-green-500 text-xs'>
					<CheckCircle className='mr-1 w-3 h-3' />
					Uploaded
				</div>
			</div>
			<button
				type='button'
				onClick={() => onRemove(index)}
				className='top-1 right-1 absolute bg-background/80 p-1 rounded-full'
			>
				<X className='w-4 h-4' />
			</button>
		</div>
	),
);
UploadedImageItem.displayName = 'UploadedImageItem';

// Optimized component implementation with memo
function TentImagesUploaderComponent({
	tentName,
	onImagesChange,
	initialImages = [],
}: TentImagesUploaderProps) {
	// State for file uploads
	const [files, setFiles] = useState<FileInfo[]>([]);
	const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
	const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const uploadInProgressRef = useRef<boolean>(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Initialize with initial images - only when they change
	useEffect(() => {
		if (JSON.stringify(initialImages) !== JSON.stringify(uploadedUrls)) {
			setUploadedUrls(initialImages);
		}
	}, [initialImages, uploadedUrls]);

	// Cleanup function for previews to avoid memory leaks
	useEffect(() => {
		return () => {
			// Cleanup any object URLs created for previews
			files.forEach((fileInfo) => {
				if (fileInfo.preview.startsWith('blob:')) {
					URL.revokeObjectURL(fileInfo.preview);
				}
			});

			// Clear any pending timeouts
			if (notificationTimeoutRef.current) {
				clearTimeout(notificationTimeoutRef.current);
			}
		};
	}, [files]);

	// Safely notify parent component about image changes
	const notifyParentOfChanges = useCallback(
		(urls: string[]) => {
			// Clear any pending timeouts
			if (notificationTimeoutRef.current) {
				clearTimeout(notificationTimeoutRef.current);
			}

			// Schedule notification outside of render cycle
			notificationTimeoutRef.current = setTimeout(() => {
				onImagesChange(urls);
			}, 0);
		},
		[onImagesChange],
	);

	// Memoized function for uploading multiple files
	const uploadAllFiles = useCallback(async () => {
		if (!tentName.trim()) {
			toast.error('Please enter a tent name before uploading images');
			return;
		}

		if (files.length === 0) {
			toast.error('Please select files to upload');
			return;
		}

		const filesToUpload = files.filter(
			(fileInfo) => fileInfo.status !== 'success',
		);

		if (filesToUpload.length === 0) {
			toast.info('All files are already uploaded');
			return;
		}

		// Avoid UI freezes by setting ref before intensive operations
		uploadInProgressRef.current = true;

		// Update status to uploading for all files using a single state update
		setFiles((prev) => {
			const updatedFiles = [...prev];
			filesToUpload.forEach((file) => {
				const index = updatedFiles.findIndex((f) => f.id === file.id);
				if (index !== -1) {
					updatedFiles[index] = { ...updatedFiles[index], status: 'uploading' };
				}
			});
			return updatedFiles;
		});

		// Delayed toast to avoid UI jank during heavy operations
		setTimeout(() => {
			toast.info(`Uploading ${filesToUpload.length} image(s)...`);
		}, 10);

		try {
			// Create a single FormData with all files
			const formData = new FormData();

			// Add all files to the same FormData
			filesToUpload.forEach((fileInfo) => {
				formData.append('files', fileInfo.file);
			});

			// Add the folder name once - use correct field 'Folder' (capital F)
			const normalizedFolderName = formatFolderName(tentName);
			formData.append('folder', normalizedFolderName);

			// Make a single API request for all files
			const response = await api.post('/upload/tents', formData, {
				onUploadProgress: (progressEvent: any) => {
					if (progressEvent.total) {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total,
						);
						// Update progress for all files in bulk to reduce state updates
						setFiles((prev) => {
							const updatedFiles = [...prev];
							for (let i = 0; i < updatedFiles.length; i++) {
								if (filesToUpload.some((fu) => fu.id === updatedFiles[i].id)) {
									updatedFiles[i] = {
										...updatedFiles[i],
										progress: percentCompleted,
									};
								}
							}
							return updatedFiles;
						});
					}
				},
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			// Check for urls array in the response
			if (response.data?.data?.urls && response.data.data.urls.length > 0) {
				const newUrls = response.data.data.urls;

				// Update all file statuses in a single operation
				setFiles((prev) => {
					const updatedFiles = [...prev];
					let urlIndex = 0;

					// Map files to be uploaded to their new URLs
					for (let i = 0; i < updatedFiles.length; i++) {
						if (filesToUpload.some((fu) => fu.id === updatedFiles[i].id)) {
							if (urlIndex < newUrls.length) {
								updatedFiles[i] = {
									...updatedFiles[i],
									status: 'success',
									url: newUrls[urlIndex],
								};
								urlIndex++;
							}
						}
					}

					return updatedFiles;
				});

				// Update uploadedUrls all at once
				setUploadedUrls((prev) => {
					const allUrls = [...prev, ...newUrls];
					// Notify parent outside of render cycle to avoid freezes
					setTimeout(() => {
						notifyParentOfChanges(allUrls);
					}, 0);
					return allUrls;
				});

				toast.success(`Successfully uploaded ${newUrls.length} image(s)`);
			} else {
				throw new Error('Invalid response format - expected urls array');
			}
		} catch (error) {
			console.error('Error uploading files:', error);
			toast.error('Failed to upload one or more files');

			// Update status to error for all files in a single operation
			setFiles((prev) => {
				const updatedFiles = [...prev];
				filesToUpload.forEach((file) => {
					const index = updatedFiles.findIndex((f) => f.id === file.id);
					if (index !== -1) {
						updatedFiles[index] = { ...updatedFiles[index], status: 'error' };
					}
				});
				return updatedFiles;
			});
		} finally {
			uploadInProgressRef.current = false;
		}
	}, [tentName, files, notifyParentOfChanges]);

	// Handle file selection
	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				const newFiles = Array.from(e.target.files);

				// Size validation (5MB per file)
				const oversizedFiles = newFiles.filter(
					(file) => file.size > 5 * 1024 * 1024,
				);
				if (oversizedFiles.length > 0) {
					toast.error('Some files exceed the 5MB size limit');
					return;
				}

				// Convert to FileInfo objects
				const newFileInfos = newFiles.map((file) => ({
					id: `${file.name}-${file.size}-${Date.now()}`,
					file,
					preview: URL.createObjectURL(file),
					status: 'idle' as FileStatus,
					progress: 0,
				}));

				// Add the new files to state
				setFiles((prev) => [...prev, ...newFileInfos]);

				// Auto-upload if tent name is available and not already uploading
				if (tentName && !uploadInProgressRef.current) {
					// Use a small timeout to ensure state is updated
					const timer = setTimeout(() => {
						uploadAllFiles();
					}, 300);

					return () => clearTimeout(timer);
				}
			}

			// Reset the input to allow selecting the same file again
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		},
		[tentName, uploadAllFiles],
	);

	// Remove a file from selection
	const removeFile = useCallback(
		(id: string) => {
			// First, look up the file to be removed
			const fileToRemove = files.find((f) => f.id === id);

			// Clean up the object URL if needed
			if (fileToRemove && fileToRemove.preview.startsWith('blob:')) {
				URL.revokeObjectURL(fileToRemove.preview);
			}

			// Update the files state
			setFiles((prev) => prev.filter((f) => f.id !== id));

			// If the file was already uploaded, update uploadedUrls separately
			if (
				fileToRemove &&
				fileToRemove.status === 'success' &&
				fileToRemove.url
			) {
				const updatedUrls = uploadedUrls.filter(
					(url) => url !== fileToRemove.url,
				);
				setUploadedUrls(updatedUrls);

				// Notify parent after state is updated
				notifyParentOfChanges(updatedUrls);
			}
		},
		[files, uploadedUrls, notifyParentOfChanges],
	);

	// Remove an uploaded image
	const removeUploadedImage = useCallback(
		(index: number) => {
			// Create a new array without the removed image
			const newUrls = [...uploadedUrls];
			newUrls.splice(index, 1);

			// Update local state
			setUploadedUrls(newUrls);

			// Notify parent after state is updated
			notifyParentOfChanges(newUrls);
		},
		[uploadedUrls, notifyParentOfChanges],
	);

	// Optimize file grid rendering to prevent unnecessary calculations
	const renderFileGrid = useCallback(() => {
		if (files.length === 0) return null;

		return (
			<div className='space-y-4'>
				<h4 className='font-medium text-sm'>Selected Images</h4>
				<div className='gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
					{files.map((fileInfo) => (
						<FileItem
							key={fileInfo.id}
							fileInfo={fileInfo}
							onRemove={removeFile}
						/>
					))}
				</div>

				{/* Upload button */}
				<Button
					type='button'
					onClick={uploadAllFiles}
					disabled={
						files.length === 0 ||
						!tentName.trim() ||
						files.every((f) => f.status === 'success') ||
						uploadInProgressRef.current
					}
				>
					<Upload className='mr-2 w-4 h-4' />
					Upload Selected Files
				</Button>
			</div>
		);
	}, [files, tentName, uploadAllFiles, removeFile]);

	// Optimize uploaded images grid rendering
	const renderUploadedImagesGrid = useCallback(() => {
		if (uploadedUrls.length === 0) return null;

		return (
			<div className='space-y-4'>
				<h4 className='font-medium text-sm'>Uploaded Images</h4>
				<div className='gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
					{uploadedUrls.map((url, index) => (
						<UploadedImageItem
							key={`uploaded-${url}`}
							url={url}
							index={index}
							onRemove={removeUploadedImage}
						/>
					))}
				</div>
			</div>
		);
	}, [uploadedUrls, removeUploadedImage]);

	// Only render empty state when truly empty
	const renderEmptyState = useCallback(() => {
		if (files.length > 0 || uploadedUrls.length > 0) return null;

		return (
			<div className='flex flex-col justify-center items-center py-4 border-2 border-dashed rounded-md text-center'>
				<ImageIcon className='mb-2 w-10 h-10 text-muted-foreground' />
				<p className='text-muted-foreground text-sm'>
					No images selected or uploaded
				</p>
				<Button
					variant='link'
					onClick={() => fileInputRef.current?.click()}
					className='mt-2'
				>
					Select images
				</Button>
			</div>
		);
	}, [files.length, uploadedUrls.length]);

	return (
		<div className='space-y-4'>
			<div className='flex flex-col space-y-2'>
				<label htmlFor='tent-images' className='font-medium text-sm'>
					Tent Images
				</label>

				{/* File input */}
				<Input
					id='tent-images'
					type='file'
					accept='image/*'
					multiple
					className='hidden'
					onChange={handleFileSelect}
					ref={fileInputRef}
				/>

				{/* Custom file selection button */}
				<Button
					type='button'
					variant='outline'
					onClick={() => fileInputRef.current?.click()}
					className='py-8 border-dashed w-full'
				>
					<Upload className='mr-2 w-4 h-4' />
					Select Images
				</Button>
			</div>

			{/* Preview of selected files */}
			{renderFileGrid()}

			{/* Already uploaded images */}
			{renderUploadedImagesGrid()}

			{/* Empty state */}
			{renderEmptyState()}
		</div>
	);
}

// Add display name for clarity and export memoized version
TentImagesUploaderComponent.displayName = 'TentImagesUploader';
export const TentImagesUploader = memo(TentImagesUploaderComponent);
