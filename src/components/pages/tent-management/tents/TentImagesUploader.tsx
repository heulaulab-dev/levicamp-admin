/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Upload, X, ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

// API and utilities
import { leviapi } from '@/lib/api';

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

export function TentImagesUploader({
	tentName,
	onImagesChange,
	initialImages = [],
}: TentImagesUploaderProps) {
	// State for file uploads
	const [files, setFiles] = useState<FileInfo[]>([]);
	const [uploadedUrls, setUploadedUrls] = useState<string[]>(
		initialImages || [],
	);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Initialize with initial images
	useEffect(() => {
		if (initialImages && initialImages.length > 0) {
			// Make sure to update the parent component with initial images
			onImagesChange(initialImages);
		}
	}, [initialImages, onImagesChange]);

	// Log current state for debugging
	useEffect(() => {
		console.log('TentImagesUploader - Current uploadedUrls:', uploadedUrls);
	}, [uploadedUrls]);

	// Cleanup function for previews to avoid memory leaks
	useEffect(() => {
		return () => {
			// Cleanup any object URLs created for previews
			files.forEach((fileInfo) => {
				if (fileInfo.preview.startsWith('blob:')) {
					URL.revokeObjectURL(fileInfo.preview);
				}
			});
		};
	}, [files]);

	// Handle file selection
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const newFiles = Array.from(e.target.files);

			// Basic validation
			const invalidFiles = newFiles.filter(
				(file) => !file.type.startsWith('image/'),
			);
			if (invalidFiles.length > 0) {
				toast.error('Only image files are allowed');
				return;
			}

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

			// Update state
			setFiles((prev) => [...prev, ...newFileInfos]);

			// Auto-upload files if tent name is provided
			if (tentName.trim()) {
				setTimeout(() => {
					uploadAllFiles();
				}, 500);
			}
		}

		// Reset the input to allow selecting the same file again
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Upload all selected files
	const uploadAllFiles = async () => {
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

		toast.info(`Uploading ${filesToUpload.length} image(s)...`);

		// Update status to uploading for all files
		setFiles((prev) =>
			prev.map((f) =>
				filesToUpload.some((fu) => fu.id === f.id)
					? { ...f, status: 'uploading' }
					: f,
			),
		);

		try {
			// Create a single FormData with all files
			const formData = new FormData();

			// Add all files to the same FormData
			filesToUpload.forEach((fileInfo) => {
				formData.append('files', fileInfo.file);
			});

			// Add the folder name once
			formData.append('folder', tentName.trim() || 'unnamed_tent');

			console.log(
				`Uploading ${
					filesToUpload.length
				} images to folder: ${tentName.trim()}`,
			);

			// Make a single API request for all files
			const response = await leviapi.post('/upload/tents', formData, {
				onUploadProgress: (progressEvent: any) => {
					if (progressEvent.total) {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total,
						);
						// Update progress for all uploading files
						setFiles((prev) =>
							prev.map((f) =>
								filesToUpload.some((fu) => fu.id === f.id)
									? { ...f, progress: percentCompleted }
									: f,
							),
						);
					}
				},
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			console.log('Upload response:', response.data);

			// Check for urls array in the response
			if (response.data?.data?.urls && response.data.data.urls.length > 0) {
				const newUrls = response.data.data.urls;

				// If the number of URLs doesn't match the number of files, show a warning
				if (newUrls.length !== filesToUpload.length) {
					console.warn(
						`Warning: Received ${newUrls.length} URLs but uploaded ${filesToUpload.length} files`,
					);
				}

				// Update file statuses with success and assign URLs
				// Each file gets its corresponding URL in the same order
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

				// Update uploadedUrls state with new URLs
				setUploadedUrls((prev) => {
					const updatedUrls = [...prev, ...newUrls];
					// Immediately notify parent component of the change
					onImagesChange(updatedUrls);
					return updatedUrls;
				});

				toast.success(`Successfully uploaded ${newUrls.length} image(s)`);
			} else {
				throw new Error(
					'Invalid response format - expected urls array in response',
				);
			}
		} catch (error) {
			console.error(`Error uploading files:`, error);

			// Mark all files as error
			setFiles((prev) =>
				prev.map((f) =>
					filesToUpload.some((fu) => fu.id === f.id)
						? { ...f, status: 'error' }
						: f,
				),
			);

			toast.error('Failed to upload images');
		}
	};

	// Remove a file from selection
	const removeFile = (id: string) => {
		setFiles((prev) => {
			const fileToRemove = prev.find((f) => f.id === id);
			if (fileToRemove && fileToRemove.preview.startsWith('blob:')) {
				URL.revokeObjectURL(fileToRemove.preview);
			}

			// If the file was already uploaded, also remove from uploadedUrls
			if (
				fileToRemove &&
				fileToRemove.status === 'success' &&
				fileToRemove.url
			) {
				setUploadedUrls((prev) => {
					const updatedUrls = prev.filter((url) => url !== fileToRemove.url);
					// Notify parent of change
					onImagesChange(updatedUrls);
					return updatedUrls;
				});
			}

			return prev.filter((f) => f.id !== id);
		});
	};

	// Remove an uploaded image
	const removeUploadedImage = (index: number) => {
		setUploadedUrls((prev) => {
			const newUrls = [...prev];
			newUrls.splice(index, 1);

			// Immediately notify parent component of the change
			onImagesChange(newUrls);
			return newUrls;
		});
	};

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
			{files.length > 0 && (
				<div className='space-y-4'>
					<h4 className='font-medium text-sm'>Selected Images</h4>
					<div className='gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
						{files.map((fileInfo) => (
							<div
								key={fileInfo.id}
								className='relative border rounded-md overflow-hidden'
							>
								{/* Image preview */}
								<div className='flex justify-center items-center bg-muted aspect-video'>
									<img
										src={fileInfo.preview}
										alt={`Preview ${fileInfo.file.name}`}
										className='max-w-full max-h-full object-contain'
									/>
								</div>

								{/* File info and status */}
								<div className='bg-background p-2'>
									<p className='font-medium text-xs truncate'>
										{fileInfo.file.name}
									</p>
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
									onClick={() => removeFile(fileInfo.id)}
									className='top-1 right-1 absolute bg-background/80 p-1 rounded-full'
								>
									<X className='w-4 h-4' />
								</button>
							</div>
						))}
					</div>

					{/* Upload button */}
					<Button
						type='button'
						onClick={uploadAllFiles}
						disabled={
							files.length === 0 ||
							!tentName.trim() ||
							files.every((f) => f.status === 'success')
						}
					>
						<Upload className='mr-2 w-4 h-4' />
						Upload Selected Files
					</Button>
				</div>
			)}

			{/* Already uploaded images */}
			{uploadedUrls.length > 0 && (
				<div className='space-y-4'>
					<h4 className='font-medium text-sm'>Uploaded Images</h4>
					<div className='gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
						{uploadedUrls.map((url, index) => (
							<div
								key={`uploaded-${index}`}
								className='relative border rounded-md overflow-hidden'
							>
								<div className='flex justify-center items-center bg-muted aspect-video'>
									<img
										src={url}
										alt={`Uploaded ${index + 1}`}
										className='max-w-full max-h-full object-contain'
									/>
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
									onClick={() => removeUploadedImage(index)}
									className='top-1 right-1 absolute bg-background/80 p-1 rounded-full'
								>
									<X className='w-4 h-4' />
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Empty state */}
			{files.length === 0 && uploadedUrls.length === 0 && (
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
			)}
		</div>
	);
}
