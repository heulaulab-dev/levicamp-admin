import { useAuthStore } from '@/hooks/auth/useAuth';
import axios from 'axios';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_TEST_API_URL,
	headers: { 'Content-Type': 'application/json' },
});

// Interceptor buat auto refresh token
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Skip refresh token untuk endpoint login atau endpoints lain yang memang belum butuh auth
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url.includes('/login')
		) {
			originalRequest._retry = true;

			try {
				const newToken = await refreshAccessToken();

				localStorage.setItem('token', newToken);
				api.defaults.headers.Authorization = `Bearer ${newToken}`;
				originalRequest.headers.Authorization = `Bearer ${newToken}`;

				return api(originalRequest); // Retry request
			} catch (err) {
				console.error('Refresh token gagal:', err);
				useAuthStore.getState().logout();
				window.location.href = '/login';
				return Promise.reject(err);
			}
		}
		return Promise.reject(error);
	},
);

// Your refresh token function
async function refreshAccessToken() {
	try {
		// Get refresh token from storage
		const refreshToken = localStorage.getItem('refreshToken');
		if (!refreshToken) throw new Error('No refresh token available');

		const response = await api.post('/refresh-token', {
			refresh_token: refreshToken,
		});

		// Asumsi response seperti: { status, message, data: { token } }
		return response.data.data.token;
	} catch (error) {
		console.error('Failed to refresh token:', error);
		throw error;
	}
}

export default api;
