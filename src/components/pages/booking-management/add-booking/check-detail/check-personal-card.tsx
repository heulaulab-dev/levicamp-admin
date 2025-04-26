'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useReservationStore } from '@/stores/use-reservation-store';

export function CheckPersonalCard() {
	// Use Zustand store
	const { personalInfo } = useReservationStore();

	if (!personalInfo) return null;

	return (
		<Card>
			<CardHeader className='border-b'>
				<CardTitle className='font-semibold text-primary text-2xl'>
					Review Personal Information
				</CardTitle>
			</CardHeader>
			<CardContent className='pt-6'>
				<div className='space-y-6'>
					<div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
						<div className='space-y-2'>
							<label className='font-medium text-sm'>Full Name</label>
							<Input value={personalInfo.name} disabled />
						</div>
						<div className='space-y-2'>
							<label className='font-medium text-sm'>Phone Number</label>
							<Input value={personalInfo.phone} disabled />
						</div>
					</div>

					<div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
						<div className='space-y-2'>
							<label className='font-medium text-sm'>Email</label>
							<Input value={personalInfo.email} disabled />
						</div>
						<div className='space-y-2'>
							<label className='font-medium text-sm'>Number of Guests</label>
							<Input value={personalInfo.guestCount} disabled />
						</div>
					</div>

					<div className='space-y-2'>
						<label className='font-medium text-sm'>Address</label>
						<Textarea value={personalInfo.address} disabled />
					</div>

					<div className='space-y-2'>
						<label className='font-medium text-sm'>
							How did you hear about us?
						</label>
						<Input value={personalInfo.source} disabled />
					</div>

					<div className='space-y-4 pt-4 border-t'>
						<div className='flex items-center space-x-2'>
							<Checkbox checked={personalInfo.agreeToTerms} disabled />
							<p className='text-sm'>Terms and Conditions</p>
						</div>
						<div className='flex items-center space-x-2'>
							<Checkbox checked={personalInfo.agreeToPrivacy} disabled />
							<p className='text-sm'>Privacy Policy</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
