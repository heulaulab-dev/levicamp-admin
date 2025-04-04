'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/hooks/auth/useAuth';
import { Loader2 } from 'lucide-react';

export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
	const { changePassword, isLoading } = useAuthStore();
	const [formData, setFormData] = useState({
		old_password: '',
		new_password: '',
		confirm_password: '',
	});
	const [errors, setErrors] = useState({
		old_password: '',
		new_password: '',
		confirm_password: '',
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear errors when user types
		setErrors((prev) => ({ ...prev, [name]: '' }));
	};

	const validateForm = () => {
		let isValid = true;
		const newErrors = { ...errors };

		if (!formData.old_password) {
			newErrors.old_password = 'Current password is required';
			isValid = false;
		}

		if (!formData.new_password) {
			newErrors.new_password = 'New password is required';
			isValid = false;
		} else if (formData.new_password.length < 6) {
			newErrors.new_password = 'Password must be at least 6 characters';
			isValid = false;
		}

		if (!formData.confirm_password) {
			newErrors.confirm_password = 'Please confirm your new password';
			isValid = false;
		} else if (formData.new_password !== formData.confirm_password) {
			newErrors.confirm_password = 'Passwords do not match';
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		const success = await changePassword(formData);
		if (success) {
			setFormData({
				old_password: '',
				new_password: '',
				confirm_password: '',
			});
			onClose();
		}
	};

	return (
		<DialogContent>
			<form onSubmit={handleSubmit}>
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Update your password to secure your account.
					</DialogDescription>
				</DialogHeader>

				<div className='gap-4 grid py-4'>
					<div className='gap-2 grid'>
						<Label htmlFor='old_password'>Current Password</Label>
						<Input
							id='old_password'
							name='old_password'
							type='password'
							value={formData.old_password}
							onChange={handleChange}
							autoComplete='current-password'
						/>
						{errors.old_password && (
							<p className='text-red-500 text-sm'>{errors.old_password}</p>
						)}
					</div>

					<div className='gap-2 grid'>
						<Label htmlFor='new_password'>New Password</Label>
						<Input
							id='new_password'
							name='new_password'
							type='password'
							value={formData.new_password}
							onChange={handleChange}
							autoComplete='new-password'
						/>
						{errors.new_password && (
							<p className='text-red-500 text-sm'>{errors.new_password}</p>
						)}
					</div>

					<div className='gap-2 grid'>
						<Label htmlFor='confirm_password'>Confirm New Password</Label>
						<Input
							id='confirm_password'
							name='confirm_password'
							type='password'
							value={formData.confirm_password}
							onChange={handleChange}
							autoComplete='new-password'
						/>
						{errors.confirm_password && (
							<p className='text-red-500 text-sm'>{errors.confirm_password}</p>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						type='button'
						variant='outline'
						onClick={onClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button type='submit' disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 w-4 h-4 animate-spin' />
								Updating...
							</>
						) : (
							'Change Password'
						)}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
