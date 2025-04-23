import { RefundDetailsProps } from '@/types/refund';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function RefundDetails({ refund }: RefundDetailsProps) {
	return (
		<div className='space-y-6'>
			<div className='gap-6 grid grid-cols-1 md:grid-cols-2'>
				<div className='space-y-2'>
					<Label htmlFor='requestId'>Request ID</Label>
					<Input id='requestId' value={refund.id} disabled readOnly />
				</div>

				<div className='space-y-2'>
					<Label htmlFor='bookingId'>Booking ID</Label>
					<Input id='bookingId' value={refund.bookingId} disabled readOnly />
				</div>

				<div className='space-y-2'>
					<Label htmlFor='amount'>Amount</Label>
					<Input
						id='amount'
						value={`Rp. ${refund.amount.toFixed(2)}`}
						disabled
						readOnly
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='requestDate'>Request Date</Label>
					<Input
						id='requestDate'
						value={new Date(refund.date).toLocaleDateString()}
						disabled
						readOnly
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='status'>Status</Label>
					<div className='flex items-center bg-background px-3 py-2 border rounded-md h-10'>
						<Badge
							variant='secondary'
							className={
								refund.status === 'pending'
									? 'bg-orange-100 text-orange-700'
									: 'bg-green-100 text-green-700'
							}
						>
							{refund.status}
						</Badge>
					</div>
				</div>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='reason'>Reason</Label>
				<Textarea id='reason' value={refund.reason} disabled readOnly />
			</div>

			{refund.rejectReason && (
				<div className='space-y-2'>
					<Label htmlFor='rejectReason'>Reject Reason</Label>
					<Textarea
						id='rejectReason'
						value={refund.rejectReason}
						disabled
						readOnly
					/>
				</div>
			)}

			{refund.notes && (
				<div className='space-y-2'>
					<Label htmlFor='notes'>Notes</Label>
					<Textarea id='notes' value={refund.notes} disabled readOnly />
				</div>
			)}
		</div>
	);
}
