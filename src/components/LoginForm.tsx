/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { PasswordInput } from './ui/password-input';
import { toast, Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<'form'>) {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const { login } = useAuthStore();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const loginSuccess = await login({ username, password });

			if (loginSuccess) {
				router.push('/overview?loginSuccess=true');
			} else {
				toast.error('Invalid username or password');
			}
		} catch (error) {
			console.error('Login error:', error);
			toast.error((error as any)?.message || 'Login failed');
		}
	};

	return (
		<form
			onSubmit={handleLogin}
			className={cn('flex flex-col gap-6 font-plus_jakarta_sans', className)}
			{...props}
		>
			<Toaster richColors />
			<div className='flex flex-col items-start gap-2 text-left'>
				<h1 className='font-semibold text-2xl'>Log in</h1>
				<p className='text-muted-foreground text-sm'>
					Log in to manage Levicamp reservations and operations.
				</p>
			</div>
			<div className='gap-6 grid'>
				<div className='gap-2 grid'>
					<Label htmlFor='username'>Username</Label>
					<Input
						id='username'
						type='text'
						name='username'
						placeholder='Enter your username'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</div>
				<div className='gap-2 grid'>
					<div className='flex items-center'>
						<Label htmlFor='password'>Password</Label>
					</div>
					<PasswordInput
						id='password'
						name='password'
						placeholder='Enter your Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<SubmitButton />
			</div>
			<div className='text-muted-foreground text-sm text-center'>
				No account? Contact management to get started.
			</div>
		</form>
	);
}

function SubmitButton() {
	const { isLoading } = useAuthStore();

	return (
		<Button disabled={isLoading} type='submit' className='w-full'>
			{isLoading ? (
				<>
					<Loader2 className='mr-2 animate-spin' size={16} />
					Please wait
				</>
			) : (
				'Sign in'
			)}
		</Button>
	);
}
