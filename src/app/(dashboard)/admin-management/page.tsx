'use client';

import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/common/PageHeader';
import { useAdminStore } from '@/hooks/admin/useAdmin';
import { useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { AddAdminForm } from '@/components/pages/login/AddAdminForm';
export default function AdminManagementPage() {
	const {
		admins,
		getAdmins,
		resetFormData,
		isLoading,
		isCreateModalOpen,
		setIsCreateModalOpen,
	} = useAdminStore();

	useEffect(() => {
		getAdmins();
	}, [getAdmins]);

	const handleOpenCreateModal = () => {
		resetFormData();
		setIsCreateModalOpen(true);
	};

	return (
		<div className='mx-auto py-10 container'>
			<PageHeader
				title='Admin Management'
				buttonLabel='Add Admin'
				onButtonClick={handleOpenCreateModal}
				isLoading={isLoading}
			/>

			<DataTable columns={columns} data={admins} />

			<Dialog
				modal
				open={isCreateModalOpen}
				onOpenChange={setIsCreateModalOpen}
			>
				<AddAdminForm />
			</Dialog>
		</div>
	);
}
