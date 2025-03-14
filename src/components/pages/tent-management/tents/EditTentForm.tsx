/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useMemo, useRef } from 'react';
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

// Types
import { Category, Tents } from '@/types/types';

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
		isEditOpen,
		setIsEditOpen,
		getTentDetails,
		resetForm,
	} = useTentStore();

	const {
		categories,
		getCategories,
		isLoading: categoriesLoading,
	} = useCategoryStore();

	// Local state management
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState('');
	const [isDataLoaded, setIsDataLoaded] = useState(false);

	// Track if data is being fetched to prevent multiple requests
	const isFetchingRef = useRef(false);

	// Memoized default facilities
	const defaultFacilities = useMemo(
		() => ['Wi-Fi', 'Air Conditioning', 'Heater', 'Electricity'],
		[],
	);

	const [facilities, setFacilities] = useState<string[]>(defaultFacilities);
	const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
	const [customFacility, setCustomFacility] = useState('');

	// Reset local state
	const resetLocalState = useCallback(() => {
		setUploadProgress(0);
		setIsUploading(false);
		setPreviewUrl('');
		setSelectedFacilities([]);
		setCustomFacility('');
		setFacilities([...defaultFacilities]);
		setIsDataLoaded(false);
	}, [defaultFacilities]);

	// CONSOLIDATED DATA FETCHING - only one place to fetch data
	useEffect(() => {
		// Skip if we're already fetching or if there's no tentId
		if (isFetchingRef.current || !tentId) return;

		const loadInitialData = async () => {
			try {
				isFetchingRef.current = true;

				// Create an array of promises to run in parallel
				const fetchPromises = [];

				// Only fetch categories if needed
				if (categories.length === 0) {
					fetchPromises.push(getCategories());
				}

				// Always fetch tent details
				fetchPromises.push(getTentDetails(tentId));

				// Wait for all promises to resolve
				const results = await Promise.all(fetchPromises);

				// The tent details will be the last result if categories were fetched,
				// or the only result if categories weren't fetched
				const tentDetails = results[results.length - 1];

				if (!tentDetails) {
					toast.error('Failed to load tent details');
					setIsEditOpen(false);
					return;
				}

				// Update facilities from tent data
				if (tentDetails.facilities && tentDetails.facilities.length > 0) {
					// Set selected facilities
					setSelectedFacilities(tentDetails.facilities);

					// Update available facilities
					setFacilities((prev) => {
						const newFacilities = [...prev];
						tentDetails.facilities.forEach((facility) => {
							if (!newFacilities.includes(facility)) {
								newFacilities.push(facility);
							}
						});
						return newFacilities;
					});
				}

				// Set preview URL if there's a tent image
				if (tentDetails.tent_image) {
					setPreviewUrl(tentDetails.tent_image);
				}

				setIsDataLoaded(true);
			} catch (error) {
				console.error('Error loading data:', error);
				toast.error('Failed to load tent details');
				setIsEditOpen(false);
			} finally {
				isFetchingRef.current = false;
			}
		};

		loadInitialData();

		// Cleanup function when component unmounts or tentId changes
		return () => {
			resetForm();
			resetLocalState();
		};
	}, [
		tentId,
		categories.length,
		getCategories,
		getTentDetails,
		setIsEditOpen,
		resetForm,
		resetLocalState,
	]);

	// Update preview URL when tent image changes
	useEffect(() => {
		if (formData.tent_image && formData.tent_image !== previewUrl) {
			setPreviewUrl(formData.tent_image);
		}
	}, [formData.tent_image, previewUrl]);

	// Input change handlers
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = e.target;
			setFormData({ [name]: value });
		},
		[setFormData],
	);

	const handleCategoryChange = useCallback(
		(value: string) => {
			setFormData({ category_id: value });
		},
		[setFormData],
	);

	// Use a ref to avoid circular updates
	const pendingFacilityUpdate = useRef<string[]>(null);

	// Handle facility toggle with debouncing
	const toggleFacility = useCallback(
		(facility: string) => {
			setSelectedFacilities((prev) => {
				const newFacilities = prev.includes(facility)
					? prev.filter((f) => f !== facility)
					: [...prev, facility];

				// Store the updated facilities for the debounced update
				pendingFacilityUpdate.current = newFacilities;

				return newFacilities;
			});

			// Update formData in the next event loop
			setTimeout(() => {
				if (pendingFacilityUpdate.current !== null) {
					setFormData({ facilities: pendingFacilityUpdate.current });
					pendingFacilityUpdate.current = null;
				}
			}, 0);
		},
		[setFormData],
	);

	const addCustomFacility = useCallback(() => {
		const trimmedFacility = customFacility.trim();

		if (!trimmedFacility) return;

		// Check if facility already exists
		if (!facilities.includes(trimmedFacility)) {
			setFacilities((prev) => [...prev, trimmedFacility]);
			toggleFacility(trimmedFacility);
			setCustomFacility('');
		} else {
			toast.error('Facility already exists');
		}
	}, [customFacility, facilities, toggleFacility]);

	// Image handling
	const handleImageChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			// Revoke previous preview URL only if it's a blob URL
			if (previewUrl && previewUrl.startsWith('blob:')) {
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
			} catch (error) {
				// Revert preview if upload fails
				if (newPreviewUrl) {
					URL.revokeObjectURL(newPreviewUrl);
					setPreviewUrl('');
				}
				toast.error('Failed to upload image');
			} finally {
				setIsUploading(false);
			}
		},
		[previewUrl, setFormData],
	);

	const handleDeleteImage = useCallback(() => {
		// Revoke the previous preview URL only if it's a blob URL
		if (previewUrl && previewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(previewUrl);
		}

		setPreviewUrl('');
		setFormData({ tent_image: '' });

		// Reset the file input
		const fileInput = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}

		toast.success('Image removed');
	}, [previewUrl, setFormData]);

	// Form submission
	const handleUpdateTent = useCallback(async () => {
		try {
			const result = await updateTent(tentId);

			if (!result.success) {
				throw new Error(result.message);
			}

			toast.success(result.message);
			setIsEditOpen(false);
		} catch (error) {
			toast.error((error as any).message || 'Failed to update tent');
		}
	}, [tentId, updateTent, setIsEditOpen]);

	const handleCancel = useCallback(() => {
		setIsEditOpen(false);
	}, [setIsEditOpen]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!isEditOpen) {
			resetForm();
			resetLocalState();
		}
	}, [isEditOpen, resetForm, resetLocalState]);

	return (
		<DialogContent className='sm:max-w-[700px] max-h-[80vh] overflow-y-auto'>
			{isLoading || !isDataLoaded ? (
				<div className='flex justify-center items-center h-48'>
					<div className='border-primary border-t-2 border-b-2 rounded-full w-8 h-8 animate-spin'></div>
					<p className='ml-3'>Loading tent details...</p>
				</div>
			) : (
				<>
					<DialogHeader>
						<DialogTitle>Edit Tent</DialogTitle>
						<DialogDescription>
							Update the details of this tent
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-6 py-4'>
						{/* Tent Category */}
						<div>
							<h3 className='mb-4 font-medium text-lg'>Tent Category</h3>
							<Select
								value={formData.category_id || ''}
								onValueChange={handleCategoryChange}
								required
							>
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
									{categories.map((category: Category) => (
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
								value={formData.name || ''}
								onChange={handleInputChange}
							/>
						</div>

						{/* Description */}
						<div className='space-y-2'>
							<Label htmlFor='description'>Description</Label>
							<Textarea
								id='description'
								name='description'
								value={formData.description || ''}
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
										<div
											className='absolute inset-0 flex justify-center items-center bg-black/10 opacity-0 group-hover:opacity-100 rounded-sm transition-opacity duration-200'
											aria-hidden='false'
										>
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
						<Button
							variant='ghost'
							onClick={handleCancel}
							disabled={isLoading || isUploading}
						>
							Cancel
						</Button>
						<Button
							onClick={handleUpdateTent}
							disabled={isLoading || isUploading}
						>
							{isLoading ? 'Updating...' : 'Update Tent'}
						</Button>
					</DialogFooter>
				</>
			)}
		</DialogContent>
	);
}
