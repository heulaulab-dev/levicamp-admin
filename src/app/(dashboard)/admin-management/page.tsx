'use client';

import { columns } from '@/components/pages/admin-management/admin-columns';
import { PageHeader } from '@/components/common/PageHeader';
import { useAdminStore } from '@/hooks/admin/use-admins';
import { useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { AddAdminForm } from '@/components/pages/admin-management/add-admin-form';
import AdminTable from '@/components/pages/admin-management/admin-table';

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

			<AdminTable columns={columns} data={admins} />

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
