/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useCategoryStore } from '@/hooks/category/useCategory';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddCategoryForm } from '@/components/tent-categories/AddCategoryForm';

export default function TentCategoriesPage() {
	const {
		categories,
		getCategories,
		isLoading,
		formData,
		setFormData,
		resetForm,
		createCategory,
		isCreateOpen,
		setIsCreateOpen,
	} = useCategoryStore();

	useEffect(() => {
		getCategories();
		console.log('Initial categories check:', categories);
	}, [getCategories]);

	const handleOpenCreateModal = () => {
		resetForm();
		setIsCreateOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await createCategory();
			setIsCreateOpen(false);
			resetForm();
		} catch (error) {}
	};

	return (
		<div className='mx-auto py-10 container'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='font-semibold text-2xl'>Tent Categories</h1>
				<Button
					onClick={handleOpenCreateModal}
					className='flex items-center gap-2'
					disabled={isLoading}
				>
					<PlusCircle size={16} />
					<span>Add Category</span>
				</Button>
			</div>

			<DataTable columns={columns} data={categories} />

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<AddCategoryForm />
			</Dialog>
		</div>
	);
}
