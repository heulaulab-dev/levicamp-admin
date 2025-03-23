/* eslint-disable @typescript-eslint/no-unused-vars */
import { RefundDetailsProps } from '@/types';
import { Badge } from '@/components/ui/badge';

export default function RefundDetails({
	refund,
	onOpenChange,
}: RefundDetailsProps) {
	return (
		<div className='space-y-4'>
			<div className='gap-4 grid grid-cols-2'>
				<div>
					<h4 className='font-medium text-sm'>Request ID</h4>
					<p>{refund.id}</p>
				</div>
				<div>
					<h4 className='font-medium text-sm'>Booking ID</h4>
					<p>{refund.bookingId}</p>
				</div>
				<div>
					<h4 className='font-medium text-sm'>Amount</h4>
					<p>${refund.amount.toFixed(2)}</p>
				</div>
				<div>
					<h4 className='font-medium text-sm'>Request Date</h4>
					<p>{new Date(refund.date).toLocaleDateString()}</p>
				</div>
				<div>
					<h4 className='font-medium text-sm'>Status</h4>
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
			<div>
				<h4 className='font-medium text-sm'>Reason</h4>
				<p>{refund.reason}</p>
			</div>
			{refund.rejectReason && (
				<div>
					<h4 className='font-medium text-sm'>Reject Reason</h4>
					<p>{refund.rejectReason}</p>
				</div>
			)}
			{refund.notes && (
				<div>
					<h4 className='font-medium text-sm'>Notes</h4>
					<p>{refund.notes}</p>
				</div>
			)}
		</div>
	);
}
