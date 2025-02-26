'use server';

import { z } from 'zod';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
	username: z
		.string()
		.min(3, { message: 'Username must be at least 3 characters' })
		.trim(),
	password: z
		.string()
		.min(1, { message: 'Password must be at least 1 characters' })
		.trim(),
});

export async function login(prevState: unknown, formData: FormData) {
	const result = loginSchema.safeParse(Object.fromEntries(formData));
	if (!result.success) {
		return { errors: result.error.flatten().fieldErrors };
	}

	const { username, password } = result.data;

	const res = await fetch(`${process.env.API_URL}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password, isNative: false }),
	});

	const data = await res.json();

	if (!res.ok) {
		// Distribusi error API ke field yang sesuai
		const field = data.message?.toLowerCase().includes('password')
			? 'password'
			: 'username';
		return { errors: { [field]: [data.message] } };
	}

	console.log('Token from API:', data.accessToken);
	await createSession(data.accessToken);
	console.log('Session created, redirecting to dashboard...');
	redirect('/dashboard?loginSuccess=true');
}

export async function logout() {
	await deleteSession();
	redirect('/login');
}
