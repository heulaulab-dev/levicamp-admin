import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';

import { useCategoryStore } from '@/hooks/category/useCategory';

export function DeleteCategoryDialog() {
	const { selectedCategory, isLoading, deleteCategory, setIsDeleteOpen } =
		useCategoryStore();

	const handleDelete = async () => {
		const result = await deleteCategory();

		if (result.success) {
			toast.success(result.message);
		} else {
			toast.error(result.message);
		}
	};

	if (!selectedCategory) return null;

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Konfirmasi Penghapusan</DialogTitle>
				<DialogDescription>
					Apakah Anda yakin ingin menghapus kategori &ldquo;
					{selectedCategory.name}&rdquo;? Tindakan ini tidak dapat dibatalkan.
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button variant='ghost' onClick={() => setIsDeleteOpen(false)}>
					Batal
				</Button>
				<Button
					variant='destructive'
					onClick={handleDelete}
					disabled={isLoading}
				>
					{isLoading ? 'Menghapus...' : 'Hapus'}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
