'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type SidebarContextType = {
	openItems: Record<string, boolean>;
	toggleItem: (title: string) => void;
	setItemOpen: (title: string, isOpen: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType>({
	openItems: {},
	toggleItem: () => {},
	setItemOpen: () => {},
});

export function SidebarProvider({
	children,
	items,
}: {
	children: React.ReactNode;
	items: Array<{
		title: string;
		url: string;
		items?: Array<{ title: string; url: string }>;
	}>;
}) {
	// Use state with localStorage for persistence
	const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
	const pathname = usePathname();

	// Load state from localStorage on mount
	useEffect(() => {
		const savedState = localStorage.getItem('sidebar-state');
		if (savedState) {
			try {
				setOpenItems(JSON.parse(savedState));
			} catch (e) {
				console.error('Failed to parse sidebar state', e);
			}
		}
	}, []);

	// Update localStorage whenever state changes
	useEffect(() => {
		if (Object.keys(openItems).length) {
			localStorage.setItem('sidebar-state', JSON.stringify(openItems));
		}
	}, [openItems]);

	// Auto-open items based on current path
	useEffect(() => {
		items.forEach((item) => {
			if (
				item.items?.some(
					(subItem) =>
						pathname === subItem.url || pathname.startsWith(subItem.url + '/'),
				)
			) {
				setOpenItems((prev) => ({ ...prev, [item.title]: true }));
			}
		});
	}, [pathname, items]);

	const toggleItem = (title: string) => {
		setOpenItems((prev) => ({
			...prev,
			[title]: !prev[title],
		}));
	};

	const setItemOpen = (title: string, isOpen: boolean) => {
		setOpenItems((prev) => ({
			...prev,
			[title]: isOpen,
		}));
	};

	return (
		<SidebarContext.Provider value={{ openItems, toggleItem, setItemOpen }}>
			{children}
		</SidebarContext.Provider>
	);
}

export const useSidebar = () => useContext(SidebarContext);
