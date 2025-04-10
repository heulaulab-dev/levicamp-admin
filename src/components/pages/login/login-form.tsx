'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { toast, Toaster } from 'sonner';
import ForgotPasswordModal from '@/components/pages/login/forgot-password-modal';

// Definisikan schema validasi dengan Zod
const loginSchema = z.object({
	username: z.string().min(1, { message: 'Username harus diisi' }),
	password: z.string().min(1, { message: 'Password harus diisi' }),
});

// Tipe untuk form values berdasarkan schema zod
type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<'div'>) {
	const router = useRouter();
	const { login, isLoading } = useAuthStore();

	// Inisialisasi react-hook-form dengan resolver zod
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	});

	async function onSubmit(values: LoginFormValues) {
		try {
			const loginSuccess = await login(values);

			if (loginSuccess) {
				router.push('/overview?loginSuccess=true');
				toast.success('Successfully logged in!');
			}
		} catch (error) {
			console.error('Login error:', error);
		}
	}

	return (
		<div
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

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='gap-6 grid'>
					<FormField
						control={form.control}
						name='username'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input placeholder='Enter your username' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<PasswordInput placeholder='Enter your password' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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
				</form>
			</Form>

			<div className='flex flex-col items-center gap-2'>
				<ForgotPasswordModal
					trigger={
						<Link
							href='#'
							className='text-sm text-center underline hover:no-underline'
						>
							Forgot password?
						</Link>
					}
				/>
				<p className='text-muted-foreground text-sm text-center'>
					No account? Contact management to get started.
				</p>
			</div>
		</div>
	);
}