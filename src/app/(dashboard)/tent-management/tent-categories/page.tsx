'use client';

import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { useEffect, useCallback } from 'react';
import { useCategory } from '@/hooks/category/useCategory';
import { Dialog } from '@/components/ui/dialog';
import { AddCategoryForm } from '@/components/pages/tent-management/tent-categories/AddCategoryForm';
import { PageHeader } from '@/components/common/page-header';

export default function TentCategoriesPage() {
	const {
		categories,
		getCategories,
		isLoading,
		resetForm,
		isCreateOpen,
		setIsCreateOpen,
	} = useCategory();

	useEffect(() => {
		console.log('Fetching categories data...');
		getCategories();
	}, []);

	const handleOpenCreateModal = () => {
		resetForm();
		setIsCreateOpen(true);
	};

	const handleRefresh = useCallback(async () => {
		await getCategories();
	}, [getCategories]);

	return (
		<div className='mx-auto py-10 container'>
			<PageHeader
				title='Tent Categories'
				buttonLabel='Add Category'
				onButtonClick={handleOpenCreateModal}
				onRefresh={handleRefresh}
				isLoading={isLoading}
			/>
			<DataTable columns={columns} data={categories} />

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<AddCategoryForm />
			</Dialog>
		</div>
	);
}
