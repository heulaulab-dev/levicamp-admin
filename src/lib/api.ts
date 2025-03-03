// lib/api.ts
import axios from 'axios';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: { 'Content-Type': 'application/json' },
});

const leviapi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_TEST_API_URL,
	headers: { 'Content-Type': 'application/json' },
	withCredentials: true,
});

// // Interceptor buat auto refresh token
// api.interceptors.response.use(
// 	(response) => response,
// 	async (error) => {
// 		const originalRequest = error.config;
// 		if (error.response?.status === 401 && !originalRequest._retry) {
// 			originalRequest._retry = true;

// 			try {
// 				const res = await api.post('/refresh-token');
// 				const newToken = res.data.token;

// 				localStorage.setItem('token', newToken);
// 				api.defaults.headers.Authorization = `Bearer ${newToken}`;
// 				originalRequest.headers.Authorization = `Bearer ${newToken}`;

// 				return api(originalRequest); // Retry request
// 			} catch (err) {
// 				console.error('Refresh token gagal:', err);
// 			}
// 		}
// 		return Promise.reject(error);
// 	},
// );

export default api;
export { leviapi };
