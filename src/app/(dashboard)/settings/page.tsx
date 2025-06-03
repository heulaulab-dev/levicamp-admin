'use client';

import { PageHeader } from '@/components/common/page-header';
import { useEffect, useState } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Lock } from 'lucide-react';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { useAdminStore } from '@/hooks/admin/use-admins';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { ChangePasswordDialog } from '@/components/change-password-dialog';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Define Zod schema for form validation - no password field for profile update
const profileFormSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }),
	username: z
		.string()
		.min(3, { message: 'Username must be at least 3 characters' }),
	phone: z.string().min(8, { message: 'Valid phone number is required' }),
	email: z.string().email({ message: 'Invalid email address' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Settings() {
	const { user } = useAuthStore();
	const { isLoading, updateAdmin, setFormData } = useAdminStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

	// Initialize form with Zod validation
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			name: '',
			username: '',
			phone: '',
			email: '',
		},
	});

	// Update form values when user data is available
	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name,
				username: user.username,
				phone: user.phone,
				email: user.email,
			});
		}
	}, [user, form]);

	// Update Zustand store when form fields change
	const handleFormChange = (name: string, value: string) => {
		setFormData({ [name]: value });
	};

	// Handle form submission
	const handleUpdateProfile = async (data: ProfileFormValues) => {
		if (!user) {
			toast.error('No user data available');
			return;
		}

		setIsSubmitting(true);

		// Update the store with form data
		Object.entries(data).forEach(([key, value]) => {
			setFormData({ [key]: value });
		});

		try {
			// We need to make the call with the user ID
			// Assuming the user object has an ID or we can extract it
			// For this example, we'll use the username as a fallback
			const userId = user.username;

			const result = await updateAdmin(userId);

			if (!result.success) {
				throw new Error(result.message);
			}

			toast.success('Profile updated successfully');

			// Refresh user data in auth store
			await useAuthStore.getState().fetchUser();
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update profile';
			toast.error(errorMessage);
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='py-10 container'>
			<PageHeader title='Settings' />

			<Dialog
				open={isChangePasswordOpen}
				onOpenChange={setIsChangePasswordOpen}
			>
				<ChangePasswordDialog onClose={() => setIsChangePasswordOpen(false)} />
			</Dialog>

			<div className='gap-6 grid'>
				<Card>
					<CardHeader>
						<CardTitle>Profile Settings</CardTitle>
						<CardDescription>Update your personal information</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleUpdateProfile)}
								className='space-y-4'
							>
								<FormField
									control={form.control}
									name='name'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full Name</FormLabel>
											<FormControl>
												<Input
													placeholder='Full Name'
													{...field}
													onChange={(e) => {
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
													placeholder='Username'
													{...field}
													onChange={(e) => {
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
														className='z-10 shadow-none -ms-px rounded-s-none'
														placeholder='Input your phone number'
														{...field}
														onChange={(e) => {
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
													type='email'
													placeholder='Email'
													{...field}
													onChange={(e) => {
														field.onChange(e);
														handleFormChange('email', e.target.value);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className='flex justify-between pt-4'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsChangePasswordOpen(true)}
									>
										<Lock className='mr-2 w-4 h-4' />
										Change Password
									</Button>

									<Button type='submit' disabled={isLoading || isSubmitting}>
										{isSubmitting ? (
											<>
												<Loader2 className='mr-2 w-4 h-4 animate-spin' />
												Saving...
											</>
										) : (
											'Save Changes'
										)}
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
