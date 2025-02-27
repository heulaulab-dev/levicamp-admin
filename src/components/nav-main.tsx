"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/contexts/sidebar-context';

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const pathname = usePathname();
	const { openItems, toggleItem } = useSidebar();

	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map((item) => {
					const hasSubItems = item.items && item.items.length > 0;
					const isOpen = openItems[item.title] || false;

					// Check if this item or any of its subitems matches the current path
					const isActiveItem = pathname === item.url;
					const isActiveParent = item.items?.some(
						(subItem) =>
							pathname === subItem.url ||
							pathname.startsWith(subItem.url + '/'),
					);

					return hasSubItems ? (
						<Collapsible
							key={item.title}
							asChild
							open={isOpen}
							onOpenChange={() => toggleItem(item.title)}
							className='group/collapsible'
						>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton
										tooltip={item.title}
										className={
											isActiveParent ? 'text-foreground font-medium' : ''
										}
									>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
										<ChevronRight className='ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform duration-200' />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{item.items?.map((subItem) => {
											const isSubItemActive = pathname === subItem.url;

											return (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton asChild>
														<Link
															href={subItem.url}
															className={
																isSubItemActive
																	? 'text-foreground font-medium'
																	: ''
															}
														>
															<span>{subItem.title}</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											);
										})}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					) : (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild tooltip={item.title}>
								<Link
									href={item.url}
									className={isActiveItem ? 'text-foreground font-medium' : ''}
								>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
