import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog } from '@radix-ui/react-dialog';
import { MoreHorizontal } from 'lucide-react';
import { EditAdminForm } from '@/components/pages/admin-management/EditAdminForm';
import { useAdminStore } from '@/hooks/admin/use-admins';
import { DeleteAdminDialog } from '@/components/pages/admin-management/DeleteAdminDialog';

type Admin = {
	id: string;
	name: string;
	username: string;
	email: string;
	phone: string;
	password: string;
	created_at: string;
	updated_at: string;
};

const ActionsDropdown = ({ admin }: { admin: Admin }) => {
	const {
		isEditModalOpen,
		setIsEditModalOpen,
		isDeleteModalOpen,
		setIsDeleteModalOpen,
		setSelectedAdmin,
	} = useAdminStore();

	const handleEditClick = () => {
		setSelectedAdmin(admin);
		setIsEditModalOpen(true);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						className='p-0 w-8 h-8'
						aria-label='Open tent actions menu'
					>
						<span className='sr-only'>Open menu</span>
						<MoreHorizontal className='w-4 h-4' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault();
							handleEditClick();
						}}
					>
						Edit Admin
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault();
							setSelectedAdmin(admin);
							setIsDeleteModalOpen(true);
						}}
					>
						Delete Admin
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs */}
			<Dialog modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<EditAdminForm />
			</Dialog>

			<Dialog
				modal
				open={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
			>
				<DeleteAdminDialog />
			</Dialog>
		</>
	);
};

export { ActionsDropdown };
