'use client';

import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { useEffect } from 'react';
import { useCategory } from '@/hooks/category/useCategory';
import { Dialog } from '@/components/ui/dialog';
import { AddCategoryForm } from '@/components/pages/tent-management/tent-categories/AddCategoryForm';
import { PageHeader } from '@/components/common/PageHeader';

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
		getCategories();
		console.log('Initial categories check:', categories);
	}, [getCategories]);

	const handleOpenCreateModal = () => {
		resetForm();
		setIsCreateOpen(true);
	};

	return (
		<div className='mx-auto py-10 container'>
			<PageHeader
				title='Tent Categories'
				buttonLabel='Add Category'
				onButtonClick={handleOpenCreateModal}
				isLoading={isLoading}
			/>
			<DataTable columns={columns} data={categories} />

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<AddCategoryForm />
			</Dialog>
		</div>
	);
}
