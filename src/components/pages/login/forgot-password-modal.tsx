'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Mail, Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import {
	Stepper,
	StepperItem,
	StepperTrigger,
	StepperIndicator,
	StepperSeparator,
} from '@/components/pages/login/stepper-forgot-password';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuthStore } from '@/hooks/auth/useAuth';

// Email step schema
const emailSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email address' }),
});

// OTP step schema
const otpSchema = z.object({
	otp: z.string().length(6, { message: 'OTP must be exactly 6 digits' }),
});

// Password step schema
const passwordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters' }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ForgotPasswordModal({
	trigger,
}: {
	trigger: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerTrigger asChild>{trigger}</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader className='text-left'>
						<DrawerTitle>Reset Your Password</DrawerTitle>
						<DrawerDescription>
							Follow the steps below to reset your password
						</DrawerDescription>
					</DrawerHeader>
					<div className='px-4'>
						<ForgotPasswordStepper onComplete={() => setOpen(false)} />
					</div>
					<DrawerFooter className='pt-2'>
						<DrawerClose asChild>
							<Button variant='outline'>Cancel</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Reset Your Password</DialogTitle>
					<DialogDescription>
						Follow the steps below to reset your password
					</DialogDescription>
				</DialogHeader>
				<ForgotPasswordStepper onComplete={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}

interface ForgotPasswordStepperProps {
	onComplete?: () => void;
}

function ForgotPasswordStepper({ onComplete }: ForgotPasswordStepperProps) {
	const [step, setStep] = useState<number>(1);
	const [email, setEmail] = useState<string>('');
	const [isComplete, setIsComplete] = useState<boolean>(false);
	const [resetToken, setResetToken] = useState<string>('');
	const [adminId, setAdminId] = useState<string>('');

	const { requestResetPassword, resetPassword, isLoading } = useAuthStore();

	// Step 1: Email Form
	const emailForm = useForm<EmailFormValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			email: '',
		},
	});

	// Step 2: OTP Form
	const otpForm = useForm<OtpFormValues>({
		resolver: zodResolver(otpSchema),
		defaultValues: {
			otp: '',
		},
	});

	// Step 3: Password Form
	const passwordForm = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});

	const onEmailSubmit = async (data: EmailFormValues) => {
		setEmail(data.email);
		const success = await requestResetPassword(data.email);
		if (success) {
			setStep(2);
		}
	};

	const onOtpSubmit = async (data: OtpFormValues) => {
		// Use the token from the OTP to verify
		const token = data.otp;
		setResetToken(token);

		try {
			const response = await api.get(`/verify-reset-token?token=${token}`);
			if (response.data.status === 200) {
				// Extract admin_id from the response data
				const adminId = response.data.data?.admin_id;
				if (!adminId) {
					toast.error('Admin ID not found in verification response');
					return;
				}
				setAdminId(adminId);
				setStep(3);
			}
		} catch (error: unknown) {
			console.error('Failed to verify reset token:', error);
			const errorResponse =
				error && typeof error === 'object' && 'response' in error
					? (error.response as { data?: { message?: string } })?.data
					: null;
			if (errorResponse?.message) {
				toast.error(errorResponse.message);
			} else {
				toast.error('Failed to verify token. Please try again.');
			}
		}
	};

	const onPasswordSubmit = async (data: PasswordFormValues) => {
		const resetData = {
			admin_id: adminId,
			email: email,
			token: resetToken,
			new_password: data.password,
			confirm_password: data.confirmPassword,
		};

		const success = await resetPassword(resetData);
		if (success) {
			setIsComplete(true);

			// Call onComplete after a delay to allow the user to see the success message
			if (onComplete) {
				setTimeout(() => {
					onComplete();
				}, 2000);
			}
		}
	};

	return (
		<div className='py-4'>
			{/* Stepper */}
			<Stepper activeStep={step} className='mb-8'>
				<StepperItem step={1}>
					<StepperTrigger>
						<StepperIndicator
							className={step >= 1 ? 'border-primary' : 'border-muted'}
						>
							<Mail className='w-5 h-5' />
						</StepperIndicator>
						<span className='mt-2 text-xs'>Email</span>
					</StepperTrigger>
				</StepperItem>

				<StepperSeparator />

				<StepperItem step={2}>
					<StepperTrigger>
						<StepperIndicator
							className={step >= 2 ? 'border-primary' : 'border-muted'}
						>
							<KeyRound className='w-5 h-5' />
						</StepperIndicator>
						<span className='mt-2 text-xs'>OTP</span>
					</StepperTrigger>
				</StepperItem>

				<StepperSeparator />

				<StepperItem step={3}>
					<StepperTrigger>
						<StepperIndicator
							className={step >= 3 ? 'border-primary' : 'border-muted'}
						>
							<Lock className='w-5 h-5' />
						</StepperIndicator>
						<span className='mt-2 text-xs'>Password</span>
					</StepperTrigger>
				</StepperItem>
			</Stepper>

			{isComplete ? (
				<div className='py-4 text-center'>
					<CheckCircle2 className='mx-auto mb-4 w-16 h-16 text-green-500' />
					<h3 className='mb-2 font-semibold text-xl'>
						Password Reset Complete
					</h3>
					<p className='text-muted-foreground'>
						Your password has been reset successfully. You can now log in with
						your new password.
					</p>
				</div>
			) : (
				<>
					{/* Step 1: Email */}
					{step === 1 && (
						<Form {...emailForm}>
							<form
								onSubmit={emailForm.handleSubmit(onEmailSubmit)}
								className='space-y-4'
							>
								<FormField
									control={emailForm.control}
									name='email'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													placeholder='Enter your email address'
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type='submit' className='w-full' disabled={isLoading}>
									{isLoading ? 'Sending...' : 'Continue'}
								</Button>
							</form>
						</Form>
					)}

					{/* Step 2: OTP */}
					{step === 2 && (
						<Form {...otpForm}>
							<form
								onSubmit={otpForm.handleSubmit(onOtpSubmit)}
								className='space-y-4'
							>
								<div className='mb-4 text-center'>
									<p className='text-muted-foreground text-sm'>
										We&apos;ve sent a verification code to{' '}
										<span className='font-medium'>{email}</span>
									</p>
								</div>
								<FormField
									control={otpForm.control}
									name='otp'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Verification Code</FormLabel>
											<FormControl>
												<InputOTP maxLength={6} {...field} className='gap-2'>
													<InputOTPGroup>
														<InputOTPSlot
															index={0}
															className='w-12 h-12 text-lg'
														/>
														<InputOTPSlot
															index={1}
															className='w-12 h-12 text-lg'
														/>
														<InputOTPSlot
															index={2}
															className='w-12 h-12 text-lg'
														/>
													</InputOTPGroup>
													<InputOTPSeparator className='mx-2' />
													<InputOTPGroup>
														<InputOTPSlot
															index={3}
															className='w-12 h-12 text-lg'
														/>
														<InputOTPSlot
															index={4}
															className='w-12 h-12 text-lg'
														/>
														<InputOTPSlot
															index={5}
															className='w-12 h-12 text-lg'
														/>
													</InputOTPGroup>
												</InputOTP>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className='flex justify-between'>
									<Button
										variant='outline'
										onClick={() => setStep(1)}
										disabled={isLoading}
									>
										Back
									</Button>
									<Button type='submit' disabled={isLoading}>
										{isLoading ? 'Verifying...' : 'Verify'}
									</Button>
								</div>
							</form>
						</Form>
					)}

					{/* Step 3: New Password */}
					{step === 3 && (
						<Form {...passwordForm}>
							<form
								onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
								className='space-y-4'
							>
								<FormField
									control={passwordForm.control}
									name='password'
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<FormControl>
												<PasswordInput
													placeholder='Enter new password'
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={passwordForm.control}
									name='confirmPassword'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm New Password</FormLabel>
											<FormControl>
												<PasswordInput
													placeholder='Confirm new password'
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className='flex justify-between'>
									<Button
										variant='outline'
										onClick={() => setStep(2)}
										disabled={isLoading}
									>
										Back
									</Button>
									<Button type='submit' disabled={isLoading}>
										{isLoading ? 'Resetting...' : 'Reset Password'}
									</Button>
								</div>
							</form>
						</Form>
					)}
				</>
			)}
		</div>
	);
}
