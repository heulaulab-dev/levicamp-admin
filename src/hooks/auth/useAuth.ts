/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { useEffect } from 'react';

type User = {
	username: string;
	name: string;
	roleName: string;
	roleCode: string;
	profile_img: string;
	email: string;
	position?: string;
	code: string;
} | null;

type AuthState = {
	user: User;
	accessToken: string | null;
	isLoading: boolean;
	login: (data: { username: string; password: string }) => Promise<boolean>;
	fetchUser: () => Promise<void>;
	logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	accessToken:
		typeof window !== 'undefined' ? localStorage.getItem('token') : null,
	isLoading: false,

	login: async (data) => {
		set({ isLoading: true });
		try {
			const res = await api.post('/auth/login', data);
			// console.log('Login API Response:', res.data); // Debugging

			const {
				username,
				name,
				role, // role dari login
				email,
				position, // ini gak ada di fetch akun, jadi gak dipake
				avatar, // avatar dari login
				accessToken,
				code,
			} = res.data;

			if (!accessToken) {
				console.error('Login failed: No access token');
				return false;
			}

			// Simpan token
			localStorage.setItem('token', accessToken);

			// Also store as a cookie for middleware access
			document.cookie = `token=${accessToken}; path=/; max-age=${
				60 * 60 * 24 * 7
			}`; // 7 days

			// Simpan user sementara, nanti fetchUser buat data lengkap
			set({
				user: {
					username,
					name,
					roleName: role, // Map `role` dari login ke `roleName`
					roleCode: '', // Role code kosong dulu, nanti diisi pas fetchUser
					email,
					position,
					profile_img: avatar, // Map `avatar` dari login ke `profile_img`
					code,
				},
				accessToken,
			});

			console.log('Login success:', useAuthStore.getState());

			// Fetch user lengkap setelah login
			await useAuthStore.getState().fetchUser();
			return true;
		} catch (error) {
			console.log('Login failed:', (error as any).response?.data || error);
			return false;
		} finally {
			set({ isLoading: false });
		}
	},

	fetchUser: async () => {
		set({ isLoading: true });
		const token = localStorage.getItem('token');

		if (!token) {
			console.warn('No token found, skipping fetchUser');
			set({ isLoading: false });
			return;
		}

		try {
			const res = await api.get('/auth/account', {
				headers: { Authorization: `Bearer ${token}` },
			});

			// Update user dengan data lengkap dari fetch akun
			set({
				user: {
					username: res.data.username,
					name: res.data.name,
					roleName: res.data.roleName,
					roleCode: res.data.roleCode,
					email: res.data.email,
					profile_img: res.data.profile_img,
					code: res.data.code,
				},
			});

			console.log('Fetched user:', useAuthStore.getState().user);
		} catch (error) {
			console.error('Failed to fetch user:', error);
			set({ user: null });
		} finally {
			set({ isLoading: false });
		}
	},

	logout: () => {
		set({ user: null, accessToken: null });
		localStorage.removeItem('token');
		localStorage.removeItem('user');

		// Clear the auth cookie for middleware
		document.cookie.split(';').forEach((cookie) => {
			document.cookie = cookie
				.replace(/^ +/, '')
				.replace(/=.*/, '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT');
		});

		delete api.defaults.headers.Authorization;
	},
}));

export function useInitAuth() {
	const { accessToken, user, fetchUser, logout } = useAuthStore();

	useEffect(() => {
		if (accessToken && !user) {
			console.log('Verifying token...'); // Debugging
			fetchUser().catch(() => {
				console.log('Invalid token, logging out');
				logout();
			});
		}
	}, [accessToken, user, fetchUser, logout]);
}
