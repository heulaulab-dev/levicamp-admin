/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PlusCircle, ArrowRight, Save, ArrowLeft } from 'lucide-react';

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

export function AddTentForm() {
	// Active step state (1: Details, 2: Images)
	const [step, setStep] = useState<1 | 2>(1);
	const [newlyCreatedTentId, setNewlyCreatedTentId] = useState<string | null>(
		null,
	);

	// Store hooks
	const {
		formData,
		setFormData,
		isLoading,
		createTent,
		updateTent,
		setIsCreateOpen,
	} = useTentStore();

	const {
		categories,
		getCategories,
		isLoading: categoriesLoading,
	} = useCategory();

	// Fetch categories when component mounts
	useEffect(() => {
		if (categories.length === 0) getCategories();
	}, [getCategories, categories.length]);

	// Local state
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
		setStep(1);
		setNewlyCreatedTentId(null);
		setSelectedFacilities([]);
		setCustomFacility('');
	};

	// Reset state when component mounts (dialog opens)
	const { resetForm } = useTentStore();
	useEffect(() => {
		resetLocalState();
		resetForm();
	}, [resetForm]);

	// Log form data changes to debug
	useEffect(() => {
		console.log('AddTentForm - Current form data:', formData);
	}, [formData]);

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

	// Validate required fields for step 1
	const validateStep1 = () => {
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

	// Handle first step submission - Create tent without images
	const handleCreateBasicTent = async () => {
		if (!validateStep1()) return;

		try {
			// Create a complete copy of form data
			const completeData = { ...formData };

			// Ensure facilities has at least one item
			if (!completeData.facilities || completeData.facilities.length === 0) {
				completeData.facilities = ['Wi-Fi'];
				setSelectedFacilities(['Wi-Fi']);
			}

			// Set placeholder image for first step
			completeData.tent_images = [];
			completeData.tent_image = 'placeholder.jpg';

			// Update all form data at once
			setFormData(completeData);

			console.log('Creating tent with data:', completeData);

			// Wait for state update to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Create basic tent data with all fields populated
			const result = await createTent();
			if (!result.success) throw new Error(result.message);

			// Save the newly created tent ID for the next step
			setNewlyCreatedTentId(result.tentId);

			// Move to next step
			setStep(2);
			toast.success('Tent details saved. Now you can add images.');
		} catch (error) {
			toast.error((error as any).message || 'Failed to create tent');
		}
	};

	// Handle final submission - Update tent with images
	const handleFinalizeTent = async () => {
		if (!newlyCreatedTentId) {
			toast.error('Something went wrong. Please try again.');
			return;
		}

		try {
			// Create a complete copy of current form data
			const completeData = { ...formData };

			// Set the primary image from the first uploaded image
			if (completeData.tent_images && completeData.tent_images.length > 0) {
				completeData.tent_image = completeData.tent_images[0];
			}

			// Update all form data at once
			setFormData(completeData);

			console.log('Finalizing tent with data:', completeData);

			// Wait for state update to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Update the tent with complete data
			const result = await updateTent(newlyCreatedTentId);
			if (!result.success) throw new Error(result.message);

			toast.success('Tent created successfully with images');
			resetLocalState();
			setIsCreateOpen(false);
		} catch (error) {
			toast.error(
				(error as any).message || 'Failed to update tent with images',
			);
		}
	};

	const handleCancel = () => {
		resetLocalState();
		setIsCreateOpen(false);
	};

	// Go back to step 1
	const handleBack = () => {
		setStep(1);
	};

	return (
		<DialogContent className='sm:max-w-[700px] max-h-[80vh] overflow-y-auto'>
			<DialogHeader>
				<DialogTitle>Add Tent</DialogTitle>
				<DialogDescription>
					{step === 1
						? 'Fill in the details to add a new tent'
						: 'Upload images for your tent'}
				</DialogDescription>
			</DialogHeader>

			{/* Progress indicators */}
			<div className='flex justify-center items-center mb-4'>
				<div
					className={`flex items-center justify-center w-8 h-8 rounded-full ${
						step === 1
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground'
					} mr-2`}
				>
					1
				</div>
				<div
					className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'} mr-2`}
				></div>
				<div
					className={`flex items-center justify-center w-8 h-8 rounded-full ${
						step === 2
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground'
					}`}
				>
					2
				</div>
			</div>

			{/* Step 1: Basic Tent Details */}
			{step === 1 && (
				<div className='space-y-6 py-4'>
					{/* Tent Category */}
					<div>
						<h3 className='mb-4 font-medium text-lg'>Tent Category</h3>
						<Select
							onValueChange={handleCategoryChange}
							required
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
								<PlusCircle className='mr-1 w-4 h-4' />
								Add
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Step 2: Image Upload */}
			{step === 2 && (
				<div className='space-y-6 py-4'>
					<TentImagesUploader
						tentName={formData.name}
						onImagesChange={handleImagesChange}
					/>

					<div className='text-muted-foreground text-sm'>
						<p>
							Upload images for your tent. You can select multiple images at
							once.
						</p>
						<p className='mt-2'>
							Once you&apos;re done, click &quot;Save Tent&quot; to complete the
							process.
						</p>
					</div>
				</div>
			)}

			<DialogFooter className='mt-6'>
				{step === 1 ? (
					<>
						<Button variant='ghost' onClick={handleCancel}>
							Cancel
						</Button>
						<Button onClick={handleCreateBasicTent} disabled={isLoading}>
							{isLoading ? 'Saving...' : 'Next'}
							{!isLoading && <ArrowRight className='ml-2 w-4 h-4' />}
						</Button>
					</>
				) : (
					<>
						<Button variant='outline' onClick={handleBack} disabled={isLoading}>
							<ArrowLeft className='mr-2 w-4 h-4' />
							Back
						</Button>
						<Button variant='ghost' onClick={handleCancel}>
							Cancel
						</Button>
						<Button onClick={handleFinalizeTent} disabled={isLoading}>
							{isLoading ? 'Saving...' : 'Save Tent'}
							{!isLoading && <Save className='ml-2 w-4 h-4' />}
						</Button>
					</>
				)}
			</DialogFooter>
		</DialogContent>
	);
}
