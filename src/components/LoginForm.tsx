'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/app/(auth)/login/action';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react';
import { PasswordInput } from './ui/password-input';
import { toast, Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<'form'>) {
	const [password, setPassword] = useState('');
	const [state, loginAction] = useActionState(login, undefined);

	return (
		<form
			action={loginAction}
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
						type='username'
						name='username'
						placeholder='Enter your username'
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
				<SubmitButton errors={state?.errors} />
			</div>
			<div className='text-muted-foreground text-sm text-center'>
				No account? Contact management to get started.
			</div>
		</form>
	);
}

function SubmitButton({ errors }: { errors?: Record<string, string[]> }) {
	const { pending } = useFormStatus();

	useEffect(() => {
		if (errors && Object.keys(errors).length > 0) {
			toast.error('Login failed', {
				description:
					errors.username?.[0] ||
					errors.password?.[0] ||
					'Invalid username or password',
				action: {
					label: 'Try again',
					onClick: () => console.log('Try again'),
				},
			});
		}
	}, [errors]);

	return (
		<Button disabled={pending} type='submit' className='w-full'>
			{pending ? (
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
