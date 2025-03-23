/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import api from '@/lib/api';
import { useEffect } from 'react';
import { toast } from 'sonner';


type User = {
	username: string;
	name: string;
	phone: string;
	email: string;
} | null;

type AuthState = {
	user: User;
	token: string | null;
	refreshToken: string | null;
	isLoading: boolean;
	login: (data: { username: string; password: string }) => Promise<boolean>;
	fetchUser: () => Promise<boolean>;
	logout: () => void;
	refreshAuthToken: () => Promise<boolean>;
	checkToken: () => Promise<boolean>;
	changePassword: (data: {
		old_password: string;
		new_password: string;
		confirm_password: string;
	}) => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
	refreshToken:
		typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
	isLoading: false,

	login: async (data) => {
		set({ isLoading: true });
		try {
			const res = await api.post('/login', data);

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

			// Immediately fetch user data after successful login
			console.log('Login successful, fetching user data...');
			const userFetched = await get().fetchUser();
			console.log('User data fetch result:', userFetched);

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

	fetchUser: async () => {
		set({ isLoading: true });
		try {
			const token = get().token;
			if (!token) {
				console.error('Cannot fetch user: No access token');
				return false;
			}

			const response = await api.get('/me', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const responseData = response.data;

			if (responseData) {
				const userData: User = {
					username: responseData.data.username,
					name: responseData.data.name,
					phone: responseData.data.phone,
					email: responseData.data.email,
				};

				set({ user: userData });
				localStorage.setItem('user', JSON.stringify(userData));
				return true;
			} else {
				console.error('No user data found in response');
				return false;
			}
		} catch (error) {
			console.error('Failed to fetch user:', error);
			console.error('Error details:', (error as any).response?.data || error);

			const errorResponse = (error as any).response?.data;

			if (errorResponse) {
				console.error('Error response:', errorResponse);
				toast.error(
					errorResponse.message ||
						errorResponse.error?.description ||
						'Failed to fetch user data',
				);
			} else {
				toast.error('Failed to fetch user data. Please try again.');
			}

			// If unauthorized, logout the user
			if ((error as any).response?.status === 401) {
				get().logout();
			}

			return false;
		} finally {
			set({ isLoading: false });
		}
	},

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

	checkToken: async () => {
		const token = get().token;
		if (!token) return false;

		try {
			console.log('Checking token validity...');
			const response = await api.post(
				'/check-token',
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			console.log('Token check response:', response.data);

			// Cek format response yang benar
			if (
				response.data?.status === 200 &&
				response.data?.message === 'Valid token'
			) {
				console.log('Token validation successful');
				return true;
			}

			console.log('Token seems invalid based on response');
			return false;
		} catch (error) {
			console.error('Token validation failed:', error);

			// Jika unauthorized (401), token memang invalid
			if ((error as any).response?.status === 401) {
				console.log('Token is invalid (401)');
				return false;
			}

			// Untuk error network/koneksi, anggap token mungkin masih valid
			console.log(
				'Network error during token check, assuming token might be valid',
			);
			return true;
		}
	},

	changePassword: async (data) => {
		set({ isLoading: true });
		try {
			const token = get().token;
			if (!token) {
				toast.error('You must be logged in to change your password');
				return false;
			}

			const response = await api.post('/change-password', data, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.data.status === 200) {
				toast.success(response.data.message || 'Password changed successfully');
				return true;
			} else {
				toast.error(response.data.message || 'Failed to change password');
				return false;
			}
		} catch (error) {
			console.error('Failed to change password:', error);

			const errorResponse = (error as any).response?.data;
			if (errorResponse) {
				toast.error(errorResponse.message || 'Failed to change password');
			} else {
				toast.error('Failed to change password. Please try again.');
			}

			return false;
		} finally {
			set({ isLoading: false });
		}
	},
}));

export function useInitAuth() {
	const { token, user, checkToken, fetchUser } = useAuthStore();

	useEffect(() => {
		// Try to load user from localStorage if available
		if (!user) {
			try {
				const storedUserData = localStorage.getItem('user');
				if (storedUserData) {
					const storedUser = JSON.parse(storedUserData);
					useAuthStore.setState({ user: storedUser });
					console.log('Loaded user from localStorage:', storedUser);
				}
			} catch (error) {
				console.error('Failed to parse user from localStorage', error);
			}
		}

		// Only fetch user if we have a token but no user data
		if (token && !user) {
			console.log('Token exists but no user data, fetching user');
			checkToken().then((isValid) => {
				if (isValid) {
					fetchUser();
				}
			});
		}
	}, [token, user, checkToken, fetchUser]);
}
