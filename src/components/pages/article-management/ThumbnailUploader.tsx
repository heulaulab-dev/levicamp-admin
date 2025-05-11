import React, { useState, useEffect } from 'react';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ThumbnailUploaderProps {
	value: string;
	onChange: (value: string) => void;
	articleId?: string | number;
}

export function ThumbnailUploader({
	value,
	onChange,
	articleId,
}: ThumbnailUploaderProps) {
	const [useUpload, setUseUpload] = useState(!value || value.trim() === '');
	const [previewUrl, setPreviewUrl] = useState(value);

	// Update preview when value changes (for form resets or initial values)
	useEffect(() => {
		setPreviewUrl(value);
		setUseUpload(!value || value.trim() === '');
	}, [value]);

	// Handle switching between upload and URL input
	const toggleMode = () => {
		setUseUpload(!useUpload);
		// Clear the current value when switching modes
		if (!useUpload) {
			onChange('');
			setPreviewUrl('');
		}
	};

	// Handle URL input change
	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value;
		onChange(url);
		setPreviewUrl(url);
	};

	// Handle image upload completion
	const handleImageUploaded = (url: string) => {
		onChange(url);
		setPreviewUrl(url);
	};

	// Clear the current image
	const clearImage = () => {
		onChange('');
		setPreviewUrl('');
	};

	return (
		<div className='space-y-3'>
			<Label className='block mb-1'>Thumbnail Image</Label>

			{/* Switch between upload and URL input */}
			<div className='flex justify-end mb-2'>
				<Button type='button' variant='ghost' size='sm' onClick={toggleMode}>
					{useUpload ? 'Use Image URL Instead' : 'Upload Image Instead'}
				</Button>
			</div>

			{useUpload ? (
				// Image uploader
				<ImageUploader
					onImageUploaded={handleImageUploaded}
					folder='articles/thumbnails'
					articleId={articleId}
				/>
			) : (
				// URL input and preview
				<div className='space-y-2'>
					<Input
						placeholder='Image URL'
						value={previewUrl || ''}
						onChange={handleUrlChange}
					/>

					{/* Image preview */}
					{previewUrl && (
						<div className='relative mt-2 border rounded-md overflow-hidden'>
							<div className='flex justify-center items-center bg-muted aspect-video'>
								<div className='relative w-full h-full'>
									<Image
										src={previewUrl}
										alt='Thumbnail preview'
										fill
										className='object-contain'
										onError={() => {
											// If image fails to load, don't clear the URL but show placeholder
											setPreviewUrl('/placeholder-image.jpg');
										}}
									/>
								</div>
							</div>

							{/* Clear button */}
							<button
								type='button'
								onClick={clearImage}
								className='top-1 right-1 absolute bg-background/80 p-1 rounded-full'
							>
								<X className='w-4 h-4' />
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
