import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
	username: string;
	name: string;
	role: string;
	email: string;
	position: string;
	avatar: string;
	accessToken: string;
	code: string;
} | null;

type AuthState = {
	user: User;
	setUser: (user: User) => void;
	logout: () => void;
	checkSession: () => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			setUser: (user) => set({ user }),
			logout: () => set({ user: null }),
			checkSession: () => {
				const token = document.cookie
					.split('; ')
					.find((row) => row.startsWith('token='))
					?.split('=')[1];

				if (!token) return set({ user: null });
			},
		}),
		{ name: 'auth-storage' },
	),
);
