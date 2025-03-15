/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { useEffect } from 'react';
import { toast } from 'sonner';
// import router from 'next/router';

type User = {
	username: string;
	name: string;
	phone: string;
	email: string;
	profile_img?: { url: string };
} | null;

type AuthState = {
	user: User;
	token: string | null;
	refreshToken: string | null;
	isLoading: boolean;
	login: (data: { username: string; password: string }) => Promise<boolean>;
	// fetchUser: () => Promise<boolean>;
	logout: () => void;
	refreshAuthToken: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
	refreshToken:
		typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
	isLoading: false,

	login: async (data) => {
		set({ isLoading: true });
		try {
			const res = await api.post('/login', data);
			// console.log('Login API Response:', res.data);

			const { data: responseData } = res.data;
			const { token, refresh_token } = responseData;

			if (!token) {
				console.error('Login failed: No access token');
				return false;
			}

			localStorage.setItem('token', token);
			localStorage.setItem('refreshToken', refresh_token);

			document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

			set({
				token: token,
				refreshToken: refresh_token,
			});

			return true;
		} catch (error) {
			console.log('Login failed:', (error as any).response?.data || error);

			const errorResponse = (error as any).response?.data;

			if (errorResponse) {
				toast.error(errorResponse.error.description);
			} else {
				toast.error('Login gagal. Silakan coba lagi.');
			}

			return false;
		} finally {
			set({ isLoading: false });
		}
	},

	// fetchUser: async () => {
	// 	set({ isLoading: true });
	// 	const token = localStorage.getItem('token');

	// 	if (!token) {
	// 		console.warn('No token found, skipping fetchUser');
	// 		set({ isLoading: false });
	// 		return false;
	// 	}

	// 	try {
	// 		const res = await api.get('/auth/account', {
	// 			headers: { Authorization: `Bearer ${token}` },
	// 		});

	// 		if (res.status === 401) {
	// 			localStorage.removeItem('token'); // Hapus token
	// 			router.push('/login'); // Redirect ke login
	// 			return false;
	// 		}

	// 		// Update user dengan data lengkap dari fetch akun
	// 		set({
	// 			user: {
	// 				username: res.data.username,
	// 				name: res.data.name,
	// 				email: res.data.email,
	// 				phone: res.data.phone,
	// 			},
	// 		});

	// 		console.log('Fetched user:', useAuthStore.getState().user);
	// 	} catch (error) {
	// 		console.error('Failed to fetch user:', error);
	// 		set({ user: null });
	// 		return false;
	// 	} finally {
	// 		set({ isLoading: false });
	// 		return true;
	// 	}
	// },

	logout: async () => {
		const currentToken = useAuthStore.getState().token;
		set({ user: null, token: null, refreshToken: null });
		try {
			const res = await api.post(
				'/logout',
				{},
				{
					headers: {
						Authorization: `Bearer ${currentToken}`,
					},
				},
			);

			console.log('Logout API Response:', res.data); // Debugging

			localStorage.removeItem('token');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('user');
		} catch (error) {
			console.error('Failed to logout:', error);
		}

		// Clear the auth cookie for middleware
		document.cookie.split(';').forEach((cookie) => {
			document.cookie = cookie
				.replace(/^ +/, '')
				.replace(/=.*/, '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT');
		});

		delete api.defaults.headers.Authorization;
	},

	refreshAuthToken: async () => {
		try {
			const refreshToken = useAuthStore.getState().refreshToken;
			if (!refreshToken) return false;

			const response = await api.post('/refresh-token', {
				refresh_token: refreshToken,
			});
			// Asumsi response seperti: { status, message, data: { token } }
			const { data: responseData } = response.data;
			const newToken = responseData.token;

			localStorage.setItem('token', newToken);
			document.cookie = `token=${newToken}; path=/; max-age=${
				60 * 60 * 24 * 7
			}`;
			set({ token: newToken });
			return true;
		} catch (error) {
			console.error('Token refresh failed:', error);
			// Clear token on failure
			set({ token: null });
			return false;
		}
	},
}));

export function useInitAuth() {
	const { token, user, logout } = useAuthStore();

	useEffect(() => {
		if (token && !user) {
			console.log('Verifying token...'); // Debugging
		}
	}, [token, user, logout]);
}
