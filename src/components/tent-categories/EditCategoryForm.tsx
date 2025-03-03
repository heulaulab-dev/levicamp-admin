import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategoryStore } from '@/hooks/category/useCategory';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

export function EditCategoryForm() {
	const { formData, setFormData, isLoading, updateCategory, setIsEditOpen } =
		useCategoryStore();

	const [newFacility, setNewFacility] = useState({ key: '', value: '' });

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData({
			[name]: name.includes('price') ? Number(value) : value,
		});
	};

	const handleFacilityChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		facilityKey: string,
	) => {
		const { value } = e.target;
		setFormData({
			facilities: {
				...formData.facilities,
				[facilityKey]: value,
			},
		});
	};

	const handleNewFacilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setNewFacility((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const addFacility = () => {
		if (newFacility.key.trim() === '') return;

		setFormData({
			facilities: {
				...formData.facilities,
				[newFacility.key]: newFacility.value,
			},
		});

		setNewFacility({ key: '', value: '' });
	};

	const removeFacility = (facilityKey: string) => {
		const updatedFacilities = { ...formData.facilities };
		delete updatedFacilities[facilityKey];

		setFormData({
			facilities: updatedFacilities,
		});
	};

	const handleUpdateCategory = async () => {
		const result = await updateCategory();

		if (result.success) {
			toast.success(result.message);
		} else {
			toast.error(result.message);
		}
	};

	return (
		<DialogContent className='sm:max-w-[700px] max-h-[80vh] overflow-y-auto'>
			<DialogHeader>
				<DialogTitle>Edit Kategori Tenda</DialogTitle>
				<DialogDescription>
					Ubah detail kategori tenda di bawah ini
				</DialogDescription>
			</DialogHeader>

			<div className='space-y-6 py-4'>
				{/* Informasi Dasar */}
				<div>
					<h3 className='mb-4 font-medium text-lg'>Informasi Dasar</h3>
					<div className='gap-4 grid'>
						<div className='items-center gap-4 grid grid-cols-4'>
							<Label htmlFor='name' className='text-right'>
								Nama
							</Label>
							<Input
								id='name'
								name='name'
								value={formData.name}
								onChange={handleInputChange}
								className='col-span-3'
							/>
						</div>

						<div className='items-center gap-4 grid grid-cols-4'>
							<Label htmlFor='description' className='text-right'>
								Deskripsi
							</Label>
							<Input
								id='description'
								name='description'
								value={formData.description}
								onChange={handleInputChange}
								className='col-span-3'
							/>
						</div>
					</div>
				</div>

				<Separator />

				{/* Harga */}
				<div>
					<h3 className='mb-4 font-medium text-lg'>Informasi Harga</h3>
					<div className='gap-4 grid'>
						<div className='items-center gap-4 grid grid-cols-4'>
							<Label htmlFor='weekday_price' className='text-right'>
								Harga Weekday
							</Label>
							<Input
								id='weekday_price'
								name='weekday_price'
								type='number'
								value={formData.weekday_price}
								onChange={handleInputChange}
								className='col-span-3'
							/>
						</div>

						<div className='items-center gap-4 grid grid-cols-4'>
							<Label htmlFor='weekend_price' className='text-right'>
								Harga Weekend
							</Label>
							<Input
								id='weekend_price'
								name='weekend_price'
								type='number'
								value={formData.weekend_price}
								onChange={handleInputChange}
								className='col-span-3'
							/>
						</div>
					</div>
				</div>

				<Separator />

				{/* Fasilitas */}
				<div>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-medium text-lg'>Fasilitas</h3>
						<div className='flex items-center gap-2'>
							<Input
								name='key'
								value={newFacility.key}
								onChange={handleNewFacilityChange}
								placeholder='Nama Fasilitas'
								className='w-[150px]'
							/>
							<Input
								name='value'
								value={newFacility.value}
								onChange={handleNewFacilityChange}
								placeholder='Nilai'
								className='w-[150px]'
							/>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={addFacility}
							>
								<PlusCircle className='mr-2 w-4 h-4' />
								Tambah
							</Button>
						</div>
					</div>

					{Object.keys(formData.facilities).length > 0 ? (
						<Accordion type='single' collapsible className='w-full'>
							{Object.entries(formData.facilities).map(
								([key, value], index) => (
									<AccordionItem key={key} value={`item-${index}`}>
										<AccordionTrigger className='hover:no-underline'>
											<div className='flex justify-between pr-4 w-full'>
												<span>{key}</span>
												<span className='text-muted-foreground'>{value}</span>
											</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className='flex items-center gap-2 p-2'>
												<Input
													value={key}
													disabled
													className='bg-muted w-1/3'
												/>
												<Input
													value={value}
													onChange={(e) => handleFacilityChange(e, key)}
													placeholder='Nilai'
													className='flex-1'
												/>
												<Button
													type='button'
													variant='ghost'
													size='icon'
													onClick={() => removeFacility(key)}
												>
													<Trash2 className='w-4 h-4 text-destructive' />
												</Button>
											</div>
										</AccordionContent>
									</AccordionItem>
								),
							)}
						</Accordion>
					) : (
						<div className='py-4 text-muted-foreground text-center'>
							Belum ada fasilitas. Tambahkan fasilitas baru menggunakan form di
							atas.
						</div>
					)}
				</div>
			</div>

			<DialogFooter className='mt-6'>
				<Button variant='ghost' onClick={() => setIsEditOpen(false)}>
					Batal
				</Button>
				<Button onClick={handleUpdateCategory} disabled={isLoading}>
					{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
