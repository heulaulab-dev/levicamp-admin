import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerTrigger,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Refund, RefundStatus, UpdateStatusProps } from '@/types/refund';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useRefunds } from '@/hooks/refunds/use-refunds';
import { toast } from 'sonner';
import { PaymentProofUploader } from './payment-proof-uploader';

export default function UpdateStatusDialog({
	children,
	refund,
}: {
	children: React.ReactNode;
	refund: Refund;
}) {
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [open, setOpen] = useState(false);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>Update Refund Status</DialogTitle>
					</DialogHeader>
					<UpdateStatus refund={refund} onOpenChange={setOpen} />
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Update Refund Status</DrawerTitle>
				</DrawerHeader>
				<div className='px-4'>
					<UpdateStatus refund={refund} onOpenChange={setOpen} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}

function UpdateStatus({ refund, onOpenChange }: UpdateStatusProps) {
	const { approveRefund, rejectRefund, isLoading } = useRefunds();
	const [status, setStatus] = useState<RefundStatus>(refund.status);
	const [rejectReason, setRejectReason] = useState(refund.rejectReason || '');
	const [notes, setNotes] = useState(refund.notes || '');
	const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			switch (status) {
				case 'processing':
					// Validate payment proof is uploaded for processing
					if (!paymentProofUrl && status === 'processing') {
						toast.error('Please upload payment proof before processing');
						setSubmitting(false);
						return;
					}

					console.log('Submitting with payment proof URL:', paymentProofUrl);

					await approveRefund(refund.id, {
						additional_info: notes,
						payment_proof: paymentProofUrl,
						refund_amount: refund.amount,
					});
					toast.success('Refund status updated to processing');
					break;
				case 'rejected':
					if (!rejectReason.trim()) {
						toast.error('Please provide a reason for rejection');
						setSubmitting(false);
						return;
					}

					await rejectRefund(refund.id, {
						additional_info: rejectReason,
					});
					toast.success('Refund request rejected');
					break;
				default:
					toast.error('Invalid status selected');
					break;
			}

			onOpenChange(false);
		} catch (error) {
			console.error('Error updating refund status:', error);
			toast.error('Failed to update refund status');
		} finally {
			setSubmitting(false);
		}
	};

	const canChangeStatus = refund.status === 'pending';

	// Handle payment proof upload completion
	const handleFileUploaded = (fileUrl: string) => {
		setPaymentProofUrl(fileUrl);
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			<div className='gap-4 grid'>
				<div>
					<Label>Refund Request ID</Label>
					<Input value={refund.id} disabled />
				</div>
				<div>
					<Label>Booking ID</Label>
					<Input value={refund.bookingId} disabled />
				</div>
				<div>
					<Label>Refund Amount</Label>
					<Input value={`Rp. ${refund.amount.toFixed(2)}`} disabled />
				</div>
				<div>
					<Label>Current Status</Label>
					<Input value={refund.status} disabled />
				</div>
				{canChangeStatus && (
					<div>
						<Label>Change Status</Label>
						<Select
							value={status}
							onValueChange={(value) => setStatus(value as RefundStatus)}
							disabled={isLoading || submitting}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='processing'>Processing</SelectItem>
								<SelectItem value='rejected'>Rejected</SelectItem>
							</SelectContent>
						</Select>
						<p className='mt-1 text-muted-foreground text-sm'>
							{status === 'processing'
								? 'Approve and process this refund'
								: status === 'rejected'
								? 'Reject this refund request'
								: 'Select an action for this refund'}
						</p>
					</div>
				)}

				{/* Show payment proof uploader when processing is selected */}
				{status === 'processing' && (
					<div className='pt-2'>
						<PaymentProofUploader
							refundId={refund.id}
							onFileUploaded={handleFileUploaded}
							initialFileUrl={refund.paymentProof}
						/>
					</div>
				)}

				{status === 'rejected' && (
					<div>
						<Label>
							Reject Reason <span className='text-red-500'>*</span>
						</Label>
						<Textarea
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							placeholder='Enter reason for rejection...'
							disabled={isLoading || submitting}
							required={status === 'rejected'}
						/>
					</div>
				)}
				<div>
					<Label>
						Notes <span className='text-red-500'>*</span>
					</Label>
					<Textarea
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder='Additional remarks...'
						disabled={isLoading || submitting}
					/>
				</div>
			</div>
			<DialogFooter>
				<Button
					type='button'
					variant='outline'
					onClick={() => onOpenChange(false)}
					disabled={isLoading || submitting}
				>
					Cancel
				</Button>
				{canChangeStatus && (
					<Button
						type='submit'
						disabled={
							isLoading ||
							submitting ||
							refund.status !== 'pending' ||
							(status === 'processing' && !paymentProofUrl)
						}
					>
						{submitting ? (
							<>
								<Loader2 className='mr-2 w-4 h-4 animate-spin' />
								Saving...
							</>
						) : (
							'Update Status'
						)}
					</Button>
				)}
			</DialogFooter>
		</form>
	);
}
