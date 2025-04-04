
'use client';

import { Button } from '@/components/ui/button';
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { useAdminStore } from '@/hooks/admin/useAdmin';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function DeleteAdminDialog() {
	const { selectedAdmin, isLoading, deleteAdmin, setIsDeleteModalOpen } =
		useAdminStore();

	const handleDelete = async () => {
		if (!selectedAdmin) return;

		const res = await deleteAdmin();

		if (res.success) {
			toast.success(res.message);
		} else {
			toast.error(res.message);
		}
	};

	if (!selectedAdmin) return null;

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Delete Confirmation</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete administrator &ldquo;
					{selectedAdmin.name}&rdquo;? This action cannot be undone.
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button
					variant='outline'
					onClick={() => setIsDeleteModalOpen(false)}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button
					variant='destructive'
					onClick={handleDelete}
					disabled={isLoading}
				>
					{isLoading ? (
						<>
							<Loader2 className='mr-2 w-4 h-4 animate-spin' />
							Deleting...
						</>
					) : (
						'Delete'
					)}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
