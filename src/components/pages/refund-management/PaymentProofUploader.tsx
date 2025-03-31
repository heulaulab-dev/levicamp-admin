import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileIcon, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

// UI Components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

// API and utilities
import api from '@/lib/api';

// Types
type PaymentProofUploaderProps = {
	refundId: string;
	onFileUploaded: (fileUrl: string) => void;
	initialFileUrl?: string;
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

// Memoized file preview component
const FilePreview = memo(({ fileInfo }: { fileInfo: FileInfo }) => {
	// Check if it's an image file
	const isImage = fileInfo.file.type.startsWith('image/');

	return (
		<div className='flex justify-center items-center bg-muted aspect-video'>
			{isImage ? (
				<div className='relative w-full h-full'>
					<Image
						src={fileInfo.preview}
						alt={`Preview ${fileInfo.file.name}`}
						fill
						className='object-contain'
					/>
				</div>
			) : (
				<div className='flex flex-col justify-center items-center'>
					<FileIcon className='w-10 h-10 text-muted-foreground' />
					<span className='mt-2 text-muted-foreground text-xs'>
						{fileInfo.file.name}
					</span>
				</div>
			)}
		</div>
	);
});
FilePreview.displayName = 'FilePreview';

// Memoized file item component
const FileItem = memo(
	({ fileInfo, onRemove }: { fileInfo: FileInfo; onRemove: () => void }) => (
		<div className='relative border rounded-md overflow-hidden'>
			{/* File preview */}
			<FilePreview fileInfo={fileInfo} />

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
				onClick={onRemove}
				className='top-1 right-1 absolute bg-background/80 p-1 rounded-full'
			>
				<X className='w-4 h-4' />
			</button>
		</div>
	),
);
FileItem.displayName = 'FileItem';

function PaymentProofUploaderComponent({
	refundId,
	onFileUploaded,
	initialFileUrl,
}: PaymentProofUploaderProps) {
	// State for file upload
	const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
	const [fileUrl, setFileUrl] = useState<string | null>(initialFileUrl || null);
	const uploadInProgressRef = useRef<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Initialize with initial file URL if provided
	useEffect(() => {
		if (initialFileUrl && initialFileUrl !== fileUrl) {
			setFileUrl(initialFileUrl);
		}
	}, [initialFileUrl, fileUrl]);

	// Cleanup function for previews to avoid memory leaks
	useEffect(() => {
		return () => {
			// Cleanup any object URLs created for previews
			if (fileInfo && fileInfo.preview.startsWith('blob:')) {
				URL.revokeObjectURL(fileInfo.preview);
			}
		};
	}, [fileInfo]);

	// Handle file selection
	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				const file = e.target.files[0];

				// Size validation (5MB per file)
				if (file.size > 5 * 1024 * 1024) {
					toast.error('File exceeds the 5MB size limit');
					return;
				}

				// Clean up existing preview URL if there was a previous file
				if (fileInfo && fileInfo.preview.startsWith('blob:')) {
					URL.revokeObjectURL(fileInfo.preview);
				}

				// Create new FileInfo
				const newFileInfo: FileInfo = {
					id: `${file.name}-${file.size}-${Date.now()}`,
					file,
					preview: URL.createObjectURL(file),
					status: 'idle',
					progress: 0,
				};

				setFileInfo(newFileInfo);
			}

			// Reset the input to allow selecting the same file again
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		},
		[fileInfo],
	);

	// Upload file function
	const uploadFile = useCallback(async () => {
		if (!fileInfo) {
			toast.error('Please select a file to upload');
			return;
		}

		if (!refundId) {
			toast.error('Refund ID is required for upload');
			return;
		}

		// Avoid UI freezes by setting ref before intensive operations
		uploadInProgressRef.current = true;

		// Update file status to uploading
		setFileInfo((prev) =>
			prev ? { ...prev, status: 'uploading', progress: 0 } : null,
		);

		try {
			// Create FormData for the file
			const formData = new FormData();
			formData.append('files', fileInfo.file);
			formData.append('folder', refundId);

			const response = await api.post('/upload/proof', formData, {
				onUploadProgress: (
					progressEvent: ProgressEvent | { loaded: number; total?: number },
				) => {
					if ('total' in progressEvent && progressEvent.total) {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total,
						);
						setFileInfo((prev) =>
							prev ? { ...prev, progress: percentCompleted } : null,
						);
					}
				},
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			// Check for urls array in the response
			console.log('Upload response:', response.data);

			if (response.data?.data?.urls && response.data.data.urls.length > 0) {
				const url = response.data.data.urls[0];

				// Update file status to success
				setFileInfo((prev) =>
					prev ? { ...prev, status: 'success', url } : null,
				);

				// Update the file URL state
				setFileUrl(url);

				// Notify parent component
				onFileUploaded(url);

				toast.success('Payment proof uploaded successfully');
				return { success: true, url };
			} else {
				throw new Error(
					'Invalid response format - expected urls array in response',
				);
			}
		} catch (error: unknown) {
			// Update error status
			setFileInfo((prev) => (prev ? { ...prev, status: 'error' } : null));

			console.error('Upload error:', error);
			toast.error(
				`Upload failed: ${
					error instanceof Error ? error.message : 'Unknown error occurred'
				}`,
			);
			return { success: false };
		} finally {
			uploadInProgressRef.current = false;
		}
	}, [fileInfo, refundId, onFileUploaded]);

	// Remove the selected file
	const removeFile = useCallback(() => {
		// Clean up the object URL if needed
		if (fileInfo && fileInfo.preview.startsWith('blob:')) {
			URL.revokeObjectURL(fileInfo.preview);
		}

		// Clear the file info
		setFileInfo(null);
	}, [fileInfo]);

	// Remove uploaded file
	const removeUploadedFile = useCallback(() => {
		setFileUrl(null);
		// Notify parent by passing empty string
		onFileUploaded('');
	}, [onFileUploaded]);

	return (
		<div className='space-y-4'>
			<div className='flex flex-col space-y-2'>
				<label htmlFor='payment-proof' className='font-medium text-sm'>
					Payment Proof
				</label>

				{/* File input */}
				<Input
					id='payment-proof'
					type='file'
					accept='image/*,.pdf'
					className='hidden'
					onChange={handleFileSelect}
					ref={fileInputRef}
				/>

				{/* Custom file selection button */}
				{!fileInfo && !fileUrl && (
					<Button
						type='button'
						variant='outline'
						onClick={() => fileInputRef.current?.click()}
						className='py-8 border-dashed w-full'
					>
						<Upload className='mr-2 w-4 h-4' />
						Select Payment Proof
					</Button>
				)}
			</div>

			{/* Preview of selected file */}
			{fileInfo && (
				<div className='space-y-4'>
					<h4 className='font-medium text-sm'>Selected File</h4>
					<div className='max-w-md'>
						<FileItem fileInfo={fileInfo} onRemove={removeFile} />
					</div>

					{/* Upload button */}
					<Button
						type='button'
						onClick={uploadFile}
						disabled={
							!fileInfo ||
							fileInfo.status === 'success' ||
							uploadInProgressRef.current
						}
					>
						<Upload className='mr-2 w-4 h-4' />
						Upload Payment Proof
					</Button>
				</div>
			)}

			{/* Already uploaded file */}
			{fileUrl && !fileInfo && (
				<div className='space-y-4'>
					<h4 className='font-medium text-sm'>Uploaded Payment Proof</h4>
					<div className='max-w-md'>
						<div className='relative border rounded-md overflow-hidden'>
							<div className='flex justify-center items-center bg-muted aspect-video'>
								{fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
									<Image
										src={fileUrl}
										alt='Payment Proof'
										className='max-w-full max-h-full object-contain'
										width={500}
										height={300}
									/>
								) : (
									<div className='flex flex-col justify-center items-center'>
										<FileIcon className='w-10 h-10 text-muted-foreground' />
										<span className='mt-2 text-muted-foreground text-xs'>
											Payment Proof Document
										</span>
										<Button
											variant='link'
											className='mt-2'
											onClick={() => window.open(fileUrl, '_blank')}
										>
											View Document
										</Button>
									</div>
								)}
							</div>
							<div className='bg-background p-2'>
								<div className='flex items-center mt-1 text-green-500 text-xs'>
									<CheckCircle className='mr-1 w-3 h-3' />
									Uploaded
								</div>
							</div>
							<button
								type='button'
								onClick={removeUploadedFile}
								className='top-1 right-1 absolute bg-background/80 p-1 rounded-full'
							>
								<X className='w-4 h-4' />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Help text */}
			<p className='text-muted-foreground text-xs'>
				Upload proof of payment (receipt, transfer confirmation, etc.).
				Supported formats: JPG, PNG, PDF. Maximum size: 5MB.
			</p>
		</div>
	);
}

// Add display name for clarity and export memoized version
PaymentProofUploaderComponent.displayName = 'PaymentProofUploader';
export const PaymentProofUploader = memo(PaymentProofUploaderComponent);
