/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useTentStore } from '@/hooks/tents/useTents';
import { Dialog } from '@/components/ui/dialog';
import { AddTentForm } from '@/components/tents/AddTentForm';

export default function TentsPage() {
	const {
		tents,
		getTents,
		isLoading,
		resetForm,
		isCreateOpen,
		setIsCreateOpen,
	} = useTentStore();

	useEffect(() => {
		getTents();
		console.log('Initial categories check:', tents);
	}, [getTents]);

	const handleOpenCreateModal = () => {
		resetForm();
		setIsCreateOpen(true);
	};
	return (
		<div className='mx-auto py-10 container'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='font-semibold text-2xl'>Tents List</h1>
				<Button
					onClick={handleOpenCreateModal}
					className='flex items-center gap-2'
					disabled={isLoading}
				>
					<PlusCircle size={16} />
					<span>Add Tent</span>
				</Button>
			</div>

			<DataTable columns={columns} data={tents} />

			<Dialog modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<AddTentForm />
			</Dialog>
		</div>
	);
}
