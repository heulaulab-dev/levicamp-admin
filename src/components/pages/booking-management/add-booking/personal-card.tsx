'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface PersonalInfoCardProps {
	onSubmit: (data: PersonalInfoData) => void;
	initialData?: PersonalInfoData;
}

export interface PersonalInfoData {
	name: string;
	phone: string;
	email?: string;
	guestCount: string;
	address: string;
	source: string;
	external: string;
	agreeToTerms: boolean;
	agreeToPrivacy: boolean;
}

export function PersonalInfoCard({
	onSubmit,
	initialData,
}: PersonalInfoCardProps) {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const data: PersonalInfoData = {
			name: formData.get('name') as string,
			phone: formData.get('phone') as string,
			email: formData.get('email') as string,
			guestCount: formData.get('guestCount') as string,
			address: formData.get('address') as string,
			source: formData.get('source') as string,
			external: formData.get('external') as string,
			agreeToTerms: formData.get('agreeToTerms') === 'on',
			agreeToPrivacy: formData.get('agreeToPrivacy') === 'on',
		};
		onSubmit(data);
	};

	const [selectedValue, setSelectedValue] = useState(
		initialData?.external || '',
	);

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			<div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
				<div className='space-y-2'>
					<label htmlFor='name' className='font-medium text-sm'>
						Full Name *
					</label>
					<Input
						id='name'
						name='name'
						required
						placeholder='Enter your full name'
						defaultValue={initialData?.name || ''}
					/>
				</div>
				<div className='space-y-2'>
					<label htmlFor='phone' className='font-medium text-sm'>
						Phone Number *
					</label>
					<div className='relative'>
						<Input
							className='peer ps-16'
							id='phone'
							name='phone'
							required
							type='tel'
							placeholder='Enter your phone number'
							defaultValue={initialData?.phone || ''}
						/>
						<span className='absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 text-muted-foreground text-sm pointer-events-none start-0'>
							+62
						</span>
					</div>
				</div>
			</div>

			<div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
				<div className='space-y-2'>
					<label htmlFor='email' className='font-medium text-sm'>
						Email
					</label>
					<Input
						id='email'
						name='email'
						type='email'
						placeholder='your@email.com'
						defaultValue={initialData?.email || ''}
					/>
				</div>
				<div className='space-y-2'>
					<label htmlFor='guestCount' className='font-medium text-sm'>
						Total Guests *
					</label>
					<div className='relative flex shadow-black/5 shadow-sm rounded-lg'>
						<Input
							className='z-10 shadow-none -me-px ps-6 rounded-e-none'
							id='guestCount'
							name='guestCount'
							required
							type='number'
							min='1'
							placeholder='1'
							defaultValue={initialData?.guestCount || ''}
						/>
						<span className='inline-flex items-center bg-background px-3 border border-input rounded-e-lg text-muted-foreground text-sm'>
							Guests
						</span>
					</div>
				</div>
			</div>

			<div className='space-y-2'>
				<label htmlFor='address' className='font-medium text-sm'>
					Address *
				</label>
				<Textarea
					id='address'
					name='address'
					required
					placeholder='Enter your address'
					defaultValue={initialData?.address || ''}
				/>
			</div>

			<div className='space-y-2'>
				<label htmlFor='source' className='font-medium text-sm'>
					How did you hear about us? *
				</label>
				<Select name='source' required defaultValue={initialData?.source}>
					<SelectTrigger>
						<SelectValue placeholder='Select an option' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='Social Media'>Social Media</SelectItem>
						<SelectItem value='Friend/Family'>Friend/Family</SelectItem>
						<SelectItem value='Search Engine'>Search Engine</SelectItem>
						<SelectItem value='Other'>Other</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* External booking source selection */}
			<div className='space-y-2'>
				<label htmlFor='external' className='font-medium text-sm'>
					From where the booking is made? *
				</label>

				<Select
					name={selectedValue === 'Other' ? '_external' : 'external'}
					required
					defaultValue={initialData?.external}
					onValueChange={setSelectedValue}
				>
					<SelectTrigger>
						<SelectValue placeholder='Select an option' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='Traveloka'>Traveloka</SelectItem>
						<SelectItem value='Agoda'>Agoda</SelectItem>
						<SelectItem value='Tiket.com'>Tiket.com</SelectItem>
						<SelectItem value='Booking.com'>Booking.com</SelectItem>
						<SelectItem value='Other'>Other</SelectItem>
					</SelectContent>
				</Select>

				{selectedValue === 'Other' && (
					<div className='mt-2'>
						<Input
							name='external'
							placeholder='Please specify source'
							required
						/>
					</div>
				)}
			</div>

			<div className='space-y-4 pt-4 border-t'>
				<div className='flex items-center space-x-2'>
					<Checkbox
						id='agreeToTerms'
						name='agreeToTerms'
						required
						defaultChecked={initialData?.agreeToTerms}
					/>
					<label htmlFor='agreeToTerms' className='text-sm'>
						I agree to the{' '}
						<Link
							href='/terms-and-conditions'
							className='font-medium text-primary hover:underline'
						>
							Terms and Conditions*
						</Link>
					</label>
				</div>
				<div className='flex items-center space-x-2'>
					<Checkbox
						id='agreeToPrivacy'
						name='agreeToPrivacy'
						required
						defaultChecked={initialData?.agreeToPrivacy}
					/>
					<label htmlFor='agreeToPrivacy' className='text-sm'>
						I agree to the{' '}
						<Link
							href='/privacy-policy'
							className='font-medium text-primary hover:underline'
						>
							Privacy Policy*
						</Link>
					</label>
				</div>
			</div>

			<Button type='submit' className='w-full'>
				Save
			</Button>
		</form>
	);
}
