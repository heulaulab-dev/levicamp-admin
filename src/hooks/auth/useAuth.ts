import { fetcher } from '@/lib/fetcher';
import { create } from 'zustand';

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
	loading: boolean;
	error: string | null;
	login: (username: string, password: string) => Promise<void>;
	logout: () => void;
};

// Creating a Zustand store for authentication
export const useAuthStore = create<AuthState>((set) => ({
	user: null, // Stores the logged-in user info
	loading: false, // Indicates whether login request is in progress
	error: null, // Stores login error messages

	// Function to handle login
	login: async (username, password) => {
		set({ loading: true, error: null }); // Set loading state

		try {
			const res = await fetcher('/api/auth/login', '', 'POST', {
				username,
				password,
				isNative: false,
			});

			// Parse the response
			const data = await res.json();

			// If response is not OK, throw an error
			if (!res.ok) throw new Error(data.message || 'Login failed');

			// Set the user data and store the access token in a cookie
			set({ user: data, loading: false });
			document.cookie = `token=${data.accessToken}; path=/; max-age=${
				7 * 24 * 60 * 60
			}`;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			// Set error state if login fails
			set({ error: err.message, loading: false });
		}
	},

	// Function to handle logout
	logout: () => {
		set({ user: null }); // Clear user state
		document.cookie = 'token=; path=/; max-age=0'; // Remove token from cookies
	},
}));
