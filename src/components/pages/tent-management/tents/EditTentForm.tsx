/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

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

// Hooks and Components
import { useTentStore } from '@/hooks/tents/useTents';
import { useCategory } from '@/hooks/category/useCategory';
import { TentImagesUploader } from './TentImagesUploader';

export function EditTentForm() {
	// Store hooks
	const {
		formData,
		setFormData,
		updateTent,
		isLoading,
		setIsEditOpen,
		selectedTent,
	} = useTentStore();

	const {
		categories,
		getCategories,
		isLoading: categoriesLoading,
	} = useCategory();

	// Fetch tent details when component mounts and the form is open
	const { getTentDetails } = useTentStore();
	useEffect(() => {
		if (selectedTent?.id) {
			getTentDetails(selectedTent.id);
		}
	}, [selectedTent?.id, getTentDetails]);

	// Log form data changes to debug
	useEffect(() => {
		console.log('Current form data:', formData);
	}, [formData]);

	// Fetch categories when component mounts
	useEffect(() => {
		if (categories.length === 0) getCategories();
	}, [getCategories, categories.length]);

	// Local state for facilities
	const [facilities, setFacilities] = useState<string[]>([
		'Wi-Fi',
		'Air Conditioning',
		'Heater',
		'Electricity',
	]); // Default facilities
	const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
		formData.facilities || [],
	);
	const [customFacility, setCustomFacility] = useState('');

	// Sync selectedFacilities with formData when formData changes
	useEffect(() => {
		if (formData.facilities) {
			setSelectedFacilities(formData.facilities);
		}
	}, [formData.facilities]);

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

	// Handle multiple images change
	const handleImagesChange = (imageUrls: string[]) => {
		setFormData({ tent_images: imageUrls });

		// Also update primary image if available
		if (imageUrls.length > 0) {
			setFormData({ tent_image: imageUrls[0] });
		}
	};

	// Facility handlers
	const toggleFacility = (facility: string) => {
		const newFacilities = selectedFacilities.includes(facility)
			? selectedFacilities.filter((f) => f !== facility)
			: [...selectedFacilities, facility];

		setSelectedFacilities(newFacilities);
		setFormData({ facilities: newFacilities });
	};

	const addCustomFacility = () => {
		if (!customFacility.trim()) return;
		setFacilities((prev) => [...prev, customFacility]);
		setCustomFacility('');
	};

	// Form validation
	const validateForm = () => {
		if (!formData.name.trim()) {
			toast.error('Tent name is required');
			return false;
		}
		if (!formData.category_id) {
			toast.error('Please select a category');
			return false;
		}
		return true;
	};

	// Handle form submission
	const handleSubmit = async () => {
		if (!selectedTent?.id) {
			toast.error('Unable to update tent: Missing ID');
			return;
		}

		if (!validateForm()) {
			return;
		}

		try {
			// Create a complete copy of current form data
			const completeData = { ...formData };

			// Ensure required fields are set
			if (!completeData.facilities || completeData.facilities.length === 0) {
				completeData.facilities = ['Wi-Fi'];
			}

			// Set tent_image from tent_images if available
			if (completeData.tent_images && completeData.tent_images.length > 0) {
				completeData.tent_image = completeData.tent_images[0];
			} else if (!completeData.tent_image) {
				completeData.tent_image = 'placeholder.jpg';
			}

			// Update all form data at once
			setFormData(completeData);

			console.log('Submitting data:', completeData);

			// Wait for state update to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Now update with all the form data
			const result = await updateTent(selectedTent.id);
			if (!result.success) throw new Error(result.message);

			toast.success('Tent updated successfully');
			setIsEditOpen(false);
		} catch (error) {
			toast.error((error as any).message || 'Failed to update tent');
		}
	};

	// Handle cancel
	const handleCancel = () => {
		setIsEditOpen(false);
	};

	return (
		<DialogContent className='sm:max-w-[700px] max-h-[80vh] overflow-y-auto'>
			<DialogHeader>
				<DialogTitle>Edit Tent</DialogTitle>
				<DialogDescription>
					Update tent details and manage images
				</DialogDescription>
			</DialogHeader>

			<div className='space-y-6 py-4'>
				{/* Tent Category */}
				<div>
					<h3 className='mb-4 font-medium text-lg'>Tent Category</h3>
					<Select
						onValueChange={handleCategoryChange}
						value={formData.category_id}
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
						required
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
							Add
						</Button>
					</div>
				</div>

				{/* Tent Images */}
				<div className='space-y-2'>
					<h3 className='mb-4 font-medium text-lg'>Tent Images</h3>
					{formData.name ? (
						<TentImagesUploader
							tentName={formData.name}
							onImagesChange={handleImagesChange}
							initialImages={formData.tent_images || []}
						/>
					) : (
						<div className='py-8 text-muted-foreground text-center'>
							Please enter a tent name before managing images.
						</div>
					)}
				</div>
			</div>

			<DialogFooter className='mt-6'>
				<Button variant='ghost' onClick={handleCancel}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} disabled={isLoading}>
					{isLoading ? 'Saving...' : 'Save Changes'}
					{!isLoading && <Save className='ml-2 w-4 h-4' />}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
