'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar';

import { useAuthStore } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';

export function NavUser({
	user,
}: {
	user: {
		username: string;
		name: string;
		phone: string;
		email: string;
		profile_img?: { url: string };
	};
}) {
	const { isMobile } = useSidebar();
	const { logout } = useAuthStore();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await logout();
			router.push('/login'); // Redirect ke login setelah logout
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
						>
							<Avatar className='w-8 h-8'>
								<AvatarImage src={user.profile_img?.url} alt={user.name} />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
							<div className='flex-1 grid text-sm text-left leading-tight'>
								<span className='font-semibold truncate'>{user.name}</span>
								<span className='text-xs truncate'>{user.email}</span>
							</div>
							<ChevronsUpDown className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='rounded-lg w-[--radix-dropdown-menu-trigger-width] min-w-56'
						side={isMobile ? 'bottom' : 'bottom'}
						align='end'
						sideOffset={4}
					>
						<DropdownMenuLabel className='p-0 font-normal'>
							<div className='flex items-center gap-2 px-1 py-1.5 text-sm text-left'>
								<Avatar className='w-8 h-8'>
									<AvatarImage src={user.profile_img?.url} alt={user.name} />
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<div className='flex-1 grid text-sm text-left leading-tight'>
									<span className='font-semibold truncate'>{user.name}</span>
									<span className='text-xs truncate'>{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
