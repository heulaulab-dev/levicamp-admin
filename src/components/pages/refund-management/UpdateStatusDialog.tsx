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
import { Refund } from '@/types';
import { useState } from 'react';
import { RefundStatus, UpdateStatusProps } from '@/types';
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
import { Upload } from 'lucide-react';

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
	const [status, setStatus] = useState<RefundStatus>(refund.status);
	const [rejectReason, setRejectReason] = useState(refund.rejectReason || '');
	const [notes, setNotes] = useState(refund.notes || '');
	const [file, setFile] = useState<File | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle form submission here
		console.log({
			refundId: refund.id,
			status,
			rejectReason,
			notes,
			file,
		});
		onOpenChange(false);
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			<div className='gap-4 grid'>
				<div>
					<Label>Refund Request ID</Label>
					<Input value={refund.id} disabled />
				</div>
				<div>
					<Label>Guest Name</Label>
					<Input value={refund.guestName} disabled />
				</div>
				<div>
					<Label>Booking ID</Label>
					<Input value={refund.bookingId} disabled />
				</div>
				<div>
					<Label>Refund Amount</Label>
					<Input value={`$${refund.amount.toFixed(2)}`} disabled />
				</div>
				<div>
					<Label>Change Status</Label>
					<Select
						value={status}
						onValueChange={(value) => setStatus(value as RefundStatus)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='pending'>Pending</SelectItem>
							<SelectItem value='approved'>Approved</SelectItem>
							<SelectItem value='rejected'>Rejected</SelectItem>
							<SelectItem value='completed'>Completed</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{status === 'rejected' && (
					<div>
						<Label>Reject Reason</Label>
						<Textarea
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							placeholder='Enter reason for rejection...'
						/>
					</div>
				)}
				{(status === 'approved' || status === 'completed') && (
					<div>
						<Label>Payment Proof Upload 📎</Label>
						<div className='flex items-center gap-2'>
							<Input
								type='file'
								onChange={(e) => setFile(e.target.files?.[0] || null)}
								accept='image/*,.pdf'
								className='flex-1'
							/>
							<Button type='button' variant='outline' size='icon'>
								<Upload className='w-4 h-4' />
							</Button>
						</div>
						<p className='mt-1 text-muted-foreground text-sm'>
							Upload proof of refund transaction (screenshot, PDF)
						</p>
					</div>
				)}
				<div>
					<Label>Notes (Optional)</Label>
					<Textarea
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder='Additional remarks...'
					/>
				</div>
			</div>
			<DialogFooter>
				<Button
					type='button'
					variant='outline'
					onClick={() => onOpenChange(false)}
				>
					Cancel
				</Button>
				<Button type='submit'>Save Changes</Button>
			</DialogFooter>
		</form>
	);
}
