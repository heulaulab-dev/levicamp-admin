import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
	openItems: Record<string, boolean>;
	toggleItem: (title: string) => void;
	setItemOpen: (title: string, isOpen: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
	persist(
		(set) => ({
			openItems: {},
			toggleItem: (title) =>
				set((state) => ({
					openItems: {
						...state.openItems,
						[title]: !state.openItems[title],
					},
				})),
			setItemOpen: (title, isOpen) =>
				set((state) => ({
					openItems: {
						...state.openItems,
						[title]: isOpen,
					},
				})),
		}),
		{
			name: 'sidebar-storage',
		},
	),
);
