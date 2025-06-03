'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect, ChangeEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminStore } from '@/hooks/admin/use-admins';
import { toast } from 'sonner';

// UI Components
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

// Define Zod schema for form validation - password is optional for updates
const adminFormSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }),
	username: z
		.string()
		.min(3, { message: 'Username must be at least 3 characters' }),
	password: z
		.string()
		.min(6, { message: 'Password must be at least 6 characters' })
		.optional()
		.or(z.string().length(0)), // Allow empty string for no password change
	phone: z.string().min(8, { message: 'Valid phone number is required' }),
	email: z.string().email({ message: 'Invalid email address' }),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export function EditAdminForm() {
	const {
		isEditModalOpen,
		setIsEditModalOpen,
		isLoading,
		updateAdmin,
		setFormData,
		selectedAdmin,
	} = useAdminStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize form with Zod validation
	const form = useForm<AdminFormValues>({
		resolver: zodResolver(adminFormSchema),
		defaultValues: {
			name: '',
			username: '',
			password: '', // Optional for edits
			phone: '',
			email: '',
		},
	});

	// Update form values when selectedAdmin changes
	useEffect(() => {
		if (selectedAdmin) {
			form.reset({
				name: selectedAdmin.name,
				username: selectedAdmin.username,
				password: selectedAdmin.password,
				phone: selectedAdmin.phone,
				email: selectedAdmin.email,
			});
		}
	}, [selectedAdmin, form]);

	// Update Zustand store when form fields change
	const handleFormChange = (name: string, value: string) => {
		setFormData({ [name]: value });
	};

	// Handle form submission
	const handleUpdateAdmin = async (data: AdminFormValues) => {
		if (!selectedAdmin?.id) {
			toast.error('No admin selected for update');
			return;
		}

		setIsSubmitting(true);

		// Update the store with form data
		Object.entries(data).forEach(([key, value]) => {
			setFormData({ [key]: value });
		});

		try {
			const result = await updateAdmin(selectedAdmin.id);

			if (!result.success) {
				throw new Error(result.message);
			}

			toast.success(result.message);
			setIsEditModalOpen(false);
		} catch (error) {
			const errorMessage =
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(error as any).response?.data?.message || 'Failed to update admin';
			toast.error(errorMessage);
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Edit Admin</DialogTitle>
					<DialogDescription>
						Update administrator account details. Leave password empty to keep
						current password.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleUpdateAdmin)}
						className='space-y-4'
						autoComplete='off'
					>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input
											placeholder='John Doe'
											{...field}
											onChange={(e: ChangeEvent<HTMLInputElement>) => {
												field.onChange(e);
												handleFormChange('name', e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='username'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input
											placeholder='johndoe'
											{...field}
											onChange={(e: ChangeEvent<HTMLInputElement>) => {
												field.onChange(e);
												handleFormChange('username', e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem className='hidden'>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<PasswordInput
											type='hidden'
											placeholder='••••••••'
											{...field}
											onChange={(e: ChangeEvent<HTMLInputElement>) => {
												field.onChange(e);
												handleFormChange('password', e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='phone'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number</FormLabel>
									<FormControl>
										<div className='flex shadow-black/5 shadow-xs rounded-lg'>
											<span className='inline-flex items-center bg-background px-3 border border-input rounded-s-lg text-muted-foreground text-sm'>
												+62
											</span>
											<Input
												autoComplete='off'
												className='z-10 shadow-none -ms-px rounded-s-none'
												placeholder='Input your phone number'
												{...field}
												onChange={(e: ChangeEvent<HTMLInputElement>) => {
													// Remove +62 prefix if user accidentally includes it
													let value = e.target.value;
													if (value.startsWith('+62')) {
														value = value.slice(3);
													} else if (value.startsWith('62')) {
														value = value.slice(2);
													} else if (value.startsWith('0')) {
														value = value.slice(1);
													}
													// Only allow numbers
													value = value.replace(/\D/g, '');

													field.onChange(value);
													handleFormChange('phone', value);
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											autoComplete='off'
											type='email'
											placeholder='john@example.com'
											{...field}
											onChange={(e: ChangeEvent<HTMLInputElement>) => {
												field.onChange(e);
												handleFormChange('email', e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsEditModalOpen(false)}
								disabled={isSubmitting || isLoading}
							>
								Cancel
							</Button>
							<Button type='submit' disabled={isSubmitting || isLoading}>
								{isSubmitting || isLoading ? (
									<>
										<Loader2 className='mr-2 w-4 h-4 animate-spin' />
										Updating...
									</>
								) : (
									'Update Admin'
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
