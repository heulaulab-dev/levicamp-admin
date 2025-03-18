/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	useState,
	useEffect,
	useCallback,
	useMemo,
	lazy,
	Suspense,
	memo,
} from 'react';
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

// Lazy load the image uploader component to reduce initial load time
const TentImagesUploader = lazy(() =>
	import('./TentImagesUploader').then((mod) => ({
		default: mod.TentImagesUploader,
	})),
);

// Memoized facility item component to reduce re-renders
const FacilityItem = memo(
	({
		facility,
		isSelected,
		onToggle,
	}: {
		facility: string;
		isSelected: boolean;
		onToggle: () => void;
	}) => (
		<div className='flex items-center gap-2'>
			<Checkbox id={facility} checked={isSelected} onCheckedChange={onToggle} />
			<Label htmlFor={facility} className='cursor-pointer'>
				{facility}
			</Label>
		</div>
	),
);

// Add display name
FacilityItem.displayName = 'FacilityItem';

// Custom Input component to reduce rerenders
const MemoizedInput = memo(function MemoizedInput({
	id,
	name,
	value,
	onChange,
	placeholder,
	required,
}: {
	id: string;
	name: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	required?: boolean;
}) {
	return (
		<Input
			id={id}
			name={name}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			required={required}
		/>
	);
});

// Custom Textarea component to reduce rerenders
const MemoizedTextarea = memo(function MemoizedTextarea({
	id,
	name,
	value,
	onChange,
	placeholder,
}: {
	id: string;
	name: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	placeholder?: string;
}) {
	return (
		<Textarea
			id={id}
			name={name}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
		/>
	);
});

// Wrap the entire form in memo to prevent unnecessary re-renders
const EditTentFormComponent = function EditTentForm() {
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

	// Only log in development mode
	const isDev = process.env.NODE_ENV === 'development';

	// Fetch categories when component mounts - only once
	useEffect(() => {
		if (categories.length === 0) getCategories();
	}, [getCategories, categories.length]);

	// Local state for facilities
	const [facilities] = useState<string[]>([
		'Wi-Fi',
		'Air Conditioning',
		'Heater',
		'Electricity',
	]); // Default facilities
	const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
		formData.facilities || [],
	);
	const [customFacility, setCustomFacility] = useState('');

	// Sync selectedFacilities with formData when formData changes - only update when needed
	useEffect(() => {
		if (
			formData.facilities &&
			JSON.stringify(formData.facilities) !== JSON.stringify(selectedFacilities)
		) {
			setSelectedFacilities(formData.facilities);
		}
	}, [formData.facilities, selectedFacilities]);

	// Input handlers with useCallback to reduce function recreation
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

	// Facility toggles with useCallback to reduce function recreation
	const toggleFacilityHandlers = useMemo(() => {
		const handlers: Record<string, () => void> = {};
		facilities.forEach((facility) => {
			handlers[facility] = () => {
				setSelectedFacilities((prev) => {
					const newFacilities = prev.includes(facility)
						? prev.filter((f) => f !== facility)
						: [...prev, facility];
					setFormData({ facilities: newFacilities });
					return newFacilities;
				});
			};
		});
		return handlers;
	}, [facilities, setFormData]);

	// Images handlers with useCallback to reduce function recreation
	const handleImagesChange = useCallback(
		(imageUrls: string[]) => {
			// Skip update if values are the same to prevent unnecessary rerenders
			if (JSON.stringify(imageUrls) !== JSON.stringify(formData.tent_images)) {
				setFormData({ tent_images: imageUrls });
			}
		},
		[formData.tent_images, setFormData],
	);

	// Form validation - only run when needed
	const validateForm = useCallback(() => {
		// Ensure we have a valid selected tent
		if (!selectedTent?.id) {
			toast.error('No tent selected for update');
			return false;
		}

		// Required fields
		if (!formData.name?.trim()) {
			toast.error('Tent name is required');
			return false;
		}

		// Valid category
		if (!formData.category_id) {
			toast.error('Please select a category');
			return false;
		}

		return true;
	}, [formData.name, formData.category_id, selectedTent?.id]);

	// Custom facility handler with useCallback
	const addCustomFacility = useCallback(() => {
		if (!customFacility.trim()) return;

		const newFacility = customFacility.trim();
		setSelectedFacilities((prev) => {
			// Skip if already exists
			if (prev.includes(newFacility)) {
				return prev;
			}

			const updated = [...prev, newFacility];
			setFormData({ facilities: updated });
			return updated;
		});

		setCustomFacility('');
	}, [customFacility, setFormData]);

	// Handle form submission
	const handleSubmit = useCallback(async () => {
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

			if (isDev) console.log('Submitting data:', completeData);

			// Now update with all the form data
			const result = await updateTent(selectedTent.id);
			if (!result.success) throw new Error(result.message);

			toast.success('Tent updated successfully');
			setIsEditOpen(false);
		} catch (error) {
			toast.error((error as any).message || 'Failed to update tent');
		}
	}, [
		formData,
		selectedTent?.id,
		validateForm,
		setFormData,
		updateTent,
		setIsEditOpen,
		isDev,
	]);

	// Handle cancel
	const handleCancel = useCallback(() => {
		setIsEditOpen(false);
	}, [setIsEditOpen]);

	// Memoize the initialImages array to prevent unnecessary re-renders
	const initialImages = useMemo(
		() => formData.tent_images || [],
		[formData.tent_images],
	);

	// Memoize Select component
	const categorySelect = useMemo(
		() => (
			<Select onValueChange={handleCategoryChange} value={formData.category_id}>
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
		),
		[categories, categoriesLoading, formData.category_id, handleCategoryChange],
	);

	// Memoize facilities section
	const facilitiesSection = useMemo(
		() => (
			<div className='space-y-2'>
				{facilities.map((facility) => (
					<FacilityItem
						key={facility}
						facility={facility}
						isSelected={selectedFacilities.includes(facility)}
						onToggle={toggleFacilityHandlers[facility]}
					/>
				))}
			</div>
		),
		[facilities, selectedFacilities, toggleFacilityHandlers],
	);

	// Conditionally render image uploading section only when tent name is available
	const imageUploaderSection = useMemo(() => {
		if (!formData.name) {
			return (
				<div className='py-8 text-muted-foreground text-center'>
					Please enter a tent name before managing images.
				</div>
			);
		}

		return (
			<Suspense
				fallback={
					<div className='p-4 text-center'>Loading image uploader...</div>
				}
			>
				<TentImagesUploader
					tentName={formData.name}
					onImagesChange={handleImagesChange}
					initialImages={initialImages}
				/>
			</Suspense>
		);
	}, [formData.name, handleImagesChange, initialImages]);

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
					{categorySelect}
				</div>

				{/* Tent Name */}
				<div className='space-y-2'>
					<Label htmlFor='name'>Tent Name</Label>
					<MemoizedInput
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
					<MemoizedTextarea
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
					{facilitiesSection}

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
					{imageUploaderSection}
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
};

// Export a memoized version of the component
export const EditTentForm = memo(EditTentFormComponent);
