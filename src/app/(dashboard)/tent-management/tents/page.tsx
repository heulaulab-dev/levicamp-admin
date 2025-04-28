/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useCallback } from 'react';
import { useTentStore } from '@/hooks/tents/useTents';
import { Dialog } from '@/components/ui/dialog';
import { AddTentForm } from '@/components/pages/tent-management/tents/AddTentForm';
import { PageHeader } from '@/components/common/page-header';
import TentsTable from '@/components/pages/tent-management/tents/tents-table';
import { columns } from '@/components/pages/tent-management/tents/tents-columns';

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
		console.log('Fetching tents data...');
		getTents().then(() => {
			console.log('Tents data loaded:', tents);
		});
	}, [getTents]);

	const handleOpenCreateModal = () => {
		resetForm();
		setIsCreateOpen(true);
	};

	const handleRefresh = useCallback(async () => {
		await getTents(true); // Force refresh
	}, [getTents]);

	return (
		<div className='mx-auto py-10 container'>
			<PageHeader
				title='Tent List'
				buttonLabel='Add Tent'
				onButtonClick={handleOpenCreateModal}
				onRefresh={handleRefresh}
				isLoading={isLoading}
			/>

			<TentsTable columns={columns} data={tents} />

			<Dialog modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<AddTentForm />
			</Dialog>
		</div>
	);
}
