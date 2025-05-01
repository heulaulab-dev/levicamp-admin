import { useTentStore } from '@/hooks/tents/useTents';
import { useCallback } from 'react';
import { toast } from 'sonner';

import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function DeleteTentDialog() {
	const { selectedTent, isLoading, setIsDeleteOpen, deleteTent } =
		useTentStore();

	const handleDelete = useCallback(async () => {
		if (!selectedTent) {
			toast.error('No tent selected for deletion');
			return;
		}

		try {
			const result = await deleteTent(selectedTent.id);
			if (result.success) {
				toast.success(result.message);
				setIsDeleteOpen(false);
			} else {
				throw new Error(result.message);
			}
		} catch (error: unknown) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete tent',
			);
		}
	}, [selectedTent, deleteTent, setIsDeleteOpen]);

	if (!selectedTent) {
		return (
			<DialogContent>
				<p className='py-4 text-center'>No tent selected for deletion.</p>
				<Button
					onClick={() => setIsDeleteOpen(false)}
					className='block mx-auto'
				>
					Close
				</Button>
			</DialogContent>
		);
	}

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Delete Tent</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete{' '}
					<span className='font-semibold'>{selectedTent.name}</span>? This
					action cannot be undone.
				</DialogDescription>
			</DialogHeader>
			<DialogFooter className='mt-6'>
				<Button
					variant='outline'
					onClick={() => setIsDeleteOpen(false)}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button
					variant='destructive'
					onClick={(e: React.MouseEvent) => {
						e.preventDefault();
						handleDelete();
					}}
					disabled={isLoading}
				>
					{isLoading ? 'Deleting...' : 'Delete'}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
