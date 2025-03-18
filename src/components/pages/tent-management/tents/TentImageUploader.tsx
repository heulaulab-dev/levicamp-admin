import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TentImageUploaderProps {
	onImageChange: (imageUrl: string) => void;
	initialImage?: string;
	onReset?: () => void;
}

export function TentImageUploader({
	onImageChange,
	initialImage = '',
	onReset,
}: TentImageUploaderProps) {
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState(initialImage);

	// Reset function that can be called externally
	const resetImageState = () => {
		setUploadProgress(0);
		setIsUploading(false);
		if (previewUrl && !initialImage) {
			URL.revokeObjectURL(previewUrl);
		}
		setPreviewUrl('');
		onImageChange('');

		// Call the parent's reset function if provided
		if (onReset) onReset();
	};

	// Expose the reset function to parent components via onReset
	if (onReset) {
		onReset = resetImageState;
	}

	// Image handling with presigned URL
	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Revoke previous preview URL to prevent memory leaks
		if (previewUrl && !initialImage) {
			URL.revokeObjectURL(previewUrl);
		}

		// Create new preview URL
		const newPreviewUrl = URL.createObjectURL(file);
		setPreviewUrl(newPreviewUrl);

		setIsUploading(true);
		setUploadProgress(0);

		try {
			const { data } = await axios.get('/api/presigned-url', {
				params: { fileName: file.name, fileType: file.type },
			});

			await axios.put(data.presignedUrl, file, {
				headers: { 'Content-Type': file.type },
				onUploadProgress: ({ loaded, total }) =>
					setUploadProgress(Math.round((loaded * 100) / (total || 100))),
			});

			onImageChange(data.fileUrl);
			toast.success('Image uploaded successfully');
		} catch {
			// Revert preview if upload fails
			if (newPreviewUrl) {
				URL.revokeObjectURL(newPreviewUrl);
				setPreviewUrl('');
			}
			toast.error('Failed to upload image');
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeleteImage = () => {
		// Revoke the previous preview URL to prevent memory leaks
		if (previewUrl && !initialImage) {
			URL.revokeObjectURL(previewUrl);
		}

		setPreviewUrl('');
		onImageChange(''); // Clear the image URL

		// Reset the file input if possible
		const fileInput = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		if (fileInput) {
			fileInput.value = ''; // Clear the file input
		}

		toast.success('Image removed');
	};

	return (
		<div className='space-y-2'>
			<Label htmlFor='tent_image'>Tent Image</Label>
			<Input
				id='tent_image'
				type='file'
				accept='image/*'
				onChange={handleImageChange}
			/>

			{/* Image preview with hover delete button */}
			{previewUrl && (
				<Card className='group relative mt-2 rounded-sm w-[100px] h-[100px] overflow-hidden'>
					<CardContent className='relative p-1'>
						<Image
							src={previewUrl}
							alt='Preview'
							className='rounded-sm w-full h-full object-cover'
							width={100}
							height={100}
							priority
						/>

						{/* Overlay that appears on hover */}
						<div className='absolute inset-0 flex justify-center items-center bg-black/10 opacity-0 group-hover:opacity-100 rounded-sm transition-opacity duration-200'>
							<Button
								type='button'
								variant='destructive'
								size='icon'
								onClick={handleDeleteImage}
								className='bg-destructive/90 hover:bg-destructive rounded-full w-10 h-10'
							>
								<Trash2 className='w-5 h-5' />
								<span className='sr-only'>Delete image</span>
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Upload progress indicator */}
			{isUploading && (
				<div className='space-y-1 mt-2'>
					<Progress value={uploadProgress} />
					<p className='text-muted-foreground text-xs'>
						Uploading: {uploadProgress}%
					</p>
				</div>
			)}
		</div>
	);
}
