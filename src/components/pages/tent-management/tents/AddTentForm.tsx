/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';

import { Checkbox } from '@/components/ui/checkbox';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Hooks
import { useTentStore } from '@/hooks/tents/useTents';
import { useCategoryStore } from '@/hooks/category/useCategory';

export function AddTentForm() {
	// Store hooks
	const { formData, setFormData, isLoading, createTent, setIsCreateOpen } =
		useTentStore();

	const {
		categories,
		getCategories,
		isLoading: categoriesLoading,
	} = useCategoryStore();

	// Fetch categories when component mounts
	useEffect(() => {
		if (categories.length === 0) getCategories();
	}, [getCategories, categories.length]);

	// Local state
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState('');
	const [facilities, setFacilities] = useState<string[]>([
		'Wi-Fi',
		'Air Conditioning',
		'Heater',
		'Electricity',
	]); // Default facilities
	const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
	const [customFacility, setCustomFacility] = useState('');

	// Reset function for local state
	const resetLocalState = () => {
		setUploadProgress(0);
		setIsUploading(false);
		setPreviewUrl('');
		setSelectedFacilities([]);
		setCustomFacility('');
	};

	// Reset state when component mounts (dialog opens)
	const { resetForm } = useTentStore();
	useEffect(() => {
		resetLocalState();
		resetForm();
	}, [resetForm]);

	// Input handlers
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData({ [name]: value });
	};

	const handleCategoryChange = (value: string) => {
		setFormData({ category_id: value });
	};

	// Facility handlers
	const toggleFacility = (facility: string) => {
		// Calculate the new facilities array first
		const newFacilities = selectedFacilities.includes(facility)
			? selectedFacilities.filter((f) => f !== facility)
			: [...selectedFacilities, facility];

		// Then update both states separately
		setSelectedFacilities(newFacilities);
		setFormData({ facilities: newFacilities });
	};

	const addCustomFacility = () => {
		if (!customFacility.trim()) return;
		setFacilities((prev) => [...prev, customFacility]);
		setCustomFacility('');
	};

	// Image handling with presigned URL
	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Revoke previous preview URL to prevent memory leaks
		if (previewUrl) {
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

			setFormData({ tent_image: data.fileUrl });
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
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

		setPreviewUrl('');
		setFormData({ tent_image: '' }); // Clear the image URL in form data

		// Reset the file input if possible
		const fileInput = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		if (fileInput) {
			fileInput.value = ''; // Clear the file input
		}

		toast.success('Image removed');
	};

	// Form submission
	const handleCreateTent = async () => {
		try {
			const result = await createTent();
			if (!result.success) throw new Error(result.message);

			toast.success(result.message);
			resetLocalState();
			setIsCreateOpen(false);
		} catch (error) {
			toast.error((error as any).message || 'Failed to create tent');
		}
	};

	const handleCancel = () => {
		resetLocalState();
		setIsCreateOpen(false);
	};

	return (
		<DialogContent className='sm:max-w-[700px] max-h-[80vh] overflow-y-auto'>
			<DialogHeader>
				<DialogTitle>Add Tent</DialogTitle>
				<DialogDescription>
					Fill in the details to add a new tent
				</DialogDescription>
			</DialogHeader>

			<div className='space-y-6 py-4'>
				{/* Tent Category */}
				<div>
					<h3 className='mb-4 font-medium text-lg'>Tent Category</h3>
					<Select onValueChange={handleCategoryChange} required>
						<SelectTrigger>
							<SelectValue
								placeholder={
									categoriesLoading
										? 'Loading categories...'
										: categories.length === 0
										? 'No categories available'
										: 'Select a category'
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{categories.map((category) => (
								<SelectItem key={category.id} value={category.id}>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Tent Name */}
				<div className='space-y-2'>
					<Label htmlFor='name'>Tent Name</Label>
					<Input
						id='name'
						name='name'
						value={formData.name}
						onChange={handleInputChange}
					/>
				</div>

				{/* Description */}
				<div className='space-y-2'>
					<Label htmlFor='description'>Description</Label>
					<Textarea
						id='description'
						name='description'
						value={formData.description}
						onChange={handleInputChange}
						placeholder='Enter tent description'
					/>
				</div>

				{/* Tent Image */}
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

				{/* Facilities */}
				<div>
					<h3 className='mb-4 font-medium text-lg'>Facilities</h3>
					<div className='space-y-2'>
						{facilities.map((facility) => (
							<div key={facility} className='flex items-center gap-2'>
								<Checkbox
									id={facility}
									checked={selectedFacilities.includes(facility)}
									onCheckedChange={() => toggleFacility(facility)}
								/>
								<Label htmlFor={facility} className='cursor-pointer'>
									{facility}
								</Label>
							</div>
						))}
					</div>

					{/* Add Custom Facility */}
					<div className='flex gap-2 mt-4'>
						<Input
							placeholder='Add a facility...'
							value={customFacility}
							onChange={(e) => setCustomFacility(e.target.value)}
						/>
						<Button variant='outline' onClick={addCustomFacility}>
							<PlusCircle className='mr-1 w-4 h-4' />
							Add
						</Button>
					</div>
				</div>
			</div>

			<DialogFooter className='mt-6'>
				<Button variant='ghost' onClick={handleCancel}>
					Cancel
				</Button>
				<Button onClick={handleCreateTent} disabled={isLoading || isUploading}>
					{isLoading ? 'Saving...' : 'Save Tent'}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
