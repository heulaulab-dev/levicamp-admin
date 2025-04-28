'use client';

import {
	ChevronsUpDown,
	LogOut,
	Mail,
	Phone,
	Settings,
	User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
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
import Link from 'next/link';

export function NavUser({
	user,
}: {
	user: {
		username: string;
		name: string;
		phone: string;
		email: string;
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
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size='lg'
								className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
							>
								<Avatar className='w-8 h-8'>
									<AvatarImage src={'/avatartion.png'} alt={user.name} />
									<AvatarFallback>LC</AvatarFallback>
								</Avatar>
								<div className='flex-1 grid text-sm text-left leading-tight'>
									<span className='font-semibold truncate'>{user.name}</span>
									<span className='text-xs truncate'>{user.email}</span>
								</div>
								<ChevronsUpDown className='ml-auto size-4' />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className='rounded-lg w-(--radix-dropdown-menu-trigger-width) min-w-56'
							side={isMobile ? 'bottom' : 'bottom'}
							align='end'
							sideOffset={4}
						>
							<DropdownMenuLabel className=''>
								Hello, {user.name}
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<User className='mr-2 w-4 h-4' />
									{user.username}
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Mail className='mr-2 w-4 h-4' />
									{user.email}
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Phone className='mr-2 w-4 h-4' />
									{user.phone}
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href='/settings'>
									<Settings className='mr-2 w-4 h-4' />
									Settings
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleLogout}>
								<LogOut className='mr-2 w-4 h-4' />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</>
	);
}
