/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
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

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Hooks
import { useTentStore } from '@/hooks/tents/useTents';
import { useCategory } from '@/hooks/category/useCategory';

// Types
import { Category, TentCategory } from '@/types/types';

interface EditTentFormProps {
	tentId: string;
}

export function EditTentForm({ tentId }: EditTentFormProps) {
	// Store hooks
	const {
		formData,
		setFormData,
		isLoading,
		updateTent,
		setIsEditOpen,
		getTentDetails,
		isEditOpen,
		resetForm,
	} = useTentStore();

	const { categories, getCategories } = useCategory();

	// Hanya state UI yang penting
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState('');

	// Load data saat komponen mount
	useEffect(() => {
		// 1. Load kategori (reuse dari cache jika ada)
		getCategories();

		// 2. Load detail tent untuk diisi ke form
		if (tentId && isEditOpen) {
			// Hanya jika dialog terbuka
			getTentDetails(tentId);
		}

		// 3. Cleanup saat komponen unmount
		return () => {
			// Reset form jika diperlukan
		};
	}, [tentId, getCategories, getTentDetails, isEditOpen]);

	// Set preview URL ketika tent_image berubah
	useEffect(() => {
		if (formData.tent_image) {
			setPreviewUrl(formData.tent_image);
		}
	}, [formData.tent_image]);

	// Handler untuk input
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData({ [name]: value });
	};

	const handleCategoryChange = (value: string) => {
		setFormData({ category_id: value });
	};

	const handleFacilityChange = (facility: string, checked: boolean) => {
		const facilities = checked
			? [...formData.facilities, facility]
			: formData.facilities.filter((f) => f !== facility);

		setFormData({ facilities });
	};

	// Handler upload image (disederhanakan)
	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);

		try {
			// Logic upload image
			const imageUrl = '...'; // Dari response upload
			setFormData({ tent_image: imageUrl });
		} catch (error) {
			toast.error('Failed to upload image');
		} finally {
			setIsUploading(false);
		}
	};

	// Handle submit
	const handleSubmit = async () => {
		try {
			const result = await updateTent(tentId);
			if (result.success) {
				toast.success('Tent updated successfully');
				setIsEditOpen(false);
			}
		} catch (error) {
			toast.error('Failed to update tent');
		}
	};

	return (
		<DialogContent className='sm:max-w-[700px] max-h-[80vh] overflow-y-auto'>
			<DialogHeader>
				<DialogTitle>Edit Tent</DialogTitle>
				<DialogDescription>Update the details of this tent</DialogDescription>
			</DialogHeader>

			<div className='space-y-6 py-4'>
				{/* Tent Category */}
				<div>
					<h3 className='mb-4 font-medium text-lg'>Tent Category</h3>
					<Select
						value={formData.category_id}
						onValueChange={handleCategoryChange}
						required
						disabled={isLoading}
					>
						<SelectTrigger>
							<SelectValue
								placeholder={
									isLoading
										? 'Loading categories...'
										: categories.length === 0
										? 'No categories available'
										: 'Select a category'
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{categories.map((category: TentCategory) => (
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
						disabled={isLoading}
						className={isLoading ? 'opacity-50' : ''}
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
						disabled={isLoading}
						className={isLoading ? 'opacity-50' : ''}
					/>
				</div>

				{/* Tent Image */}
				<div className='space-y-2'>
					<Label htmlFor='tent_image'>Tent Image</Label>
					<Input
						id='tent_image'
						type='file'
						accept='image/*'
						onChange={handleImageUpload}
						disabled={isLoading || isUploading}
					/>

					{/* Image preview with hover delete button */}
					{previewUrl && (
						<Card className='group relative mt-2 rounded-sm w-[100px] h-[100px] overflow-hidden'>
							<CardContent className='relative p-1'>
								<Image
									src={previewUrl}
									alt='Preview'
									className={`rounded-sm w-full h-full object-cover ${
										isLoading ? 'opacity-50' : ''
									}`}
									width={100}
									height={100}
									priority
								/>

								{/* Overlay that appears on hover */}
								<div
									className='absolute inset-0 flex justify-center items-center bg-black/10 opacity-0 group-hover:opacity-100 rounded-sm transition-opacity duration-200'
									aria-hidden='false'
								>
									<Button
										type='button'
										variant='destructive'
										size='icon'
										onClick={() => setFormData({ tent_image: '' })}
										disabled={isLoading || isUploading}
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
							<Progress value={0} />
							<p className='text-muted-foreground text-xs'>Uploading: 0%</p>
						</div>
					)}
				</div>
			</div>

			<DialogFooter className='mt-6'>
				<Button
					variant='ghost'
					onClick={() => setIsEditOpen(false)}
					disabled={isLoading || isUploading}
				>
					Cancel
				</Button>
				<Button onClick={handleSubmit} disabled={isLoading || isUploading}>
					{isLoading ? 'Updating...' : 'Update Tent'}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
